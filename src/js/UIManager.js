class UIManager {
  constructor(storageManager, healthMetrics, userProfile, healthAPI, chartRenderer, painSurvey, surveyCalendar, surveyConfig, analyticsManager) {
    this.storage = storageManager;
    this.healthMetrics = healthMetrics;
    this.userProfile = userProfile;
    this.healthAPI = healthAPI;
    this.chartRenderer = chartRenderer;
    this.painSurvey = painSurvey;
    this.surveyCalendar = surveyCalendar;
    this.surveyConfig = surveyConfig;
    this.analyticsManager = analyticsManager;
    this.currentPage = 'survey';
    this.currentWeather = null;
    this.currentPainType = null;
    this.currentQuestionIndex = 0;
    this.currentSurveyAnswers = {};
    this.visibleQuestions = [];
    this.potentialQuestions = [];
  }

  initializeUI() {
    this.setupNavigation();
    this.setupThemeToggle();
    this.setupPainTypeSelector();
    this.setupSettingsForm();
    this.setupDataManagement();
    this.loadSurveysFromStorage();
    this.renderCalendar();
    this.checkDailyNotification();
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav__link');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.target.dataset.page;
        this.switchPage(page);
        
        if (mainNav.classList.contains('nav--active')) {
          mainNav.classList.remove('nav--active');
          if (mobileMenuBtn) {
            mobileMenuBtn.classList.remove('active');
          }
        }
      });
    });

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        mainNav.classList.toggle('nav--active');
      });
    }
  }

  switchPage(page) {
    const sections = document.querySelectorAll('.page__section');
    const links = document.querySelectorAll('.nav__link');

    sections.forEach(section => section.classList.remove('page__section--active'));
    links.forEach(link => link.classList.remove('nav__link--active'));

    const activeSection = document.getElementById(`${page}-page`);
    if (activeSection) {
      activeSection.classList.add('page__section--active');
    }

    const activeLink = document.querySelector(`[data-page="${page}"]`);
    if (activeLink) {
      activeLink.classList.add('nav__link--active');
    }

    this.currentPage = page;

    if (page === 'metrics') {
      this.renderCalendar();
    } else if (page === 'analysis') {
      this.loadAnalysis();
    }
  }

  setupThemeToggle() {
    const lightBtn = document.getElementById('themeLight');
    const darkBtn = document.getElementById('themeDark');
    const headerToggle = document.getElementById('themeToggle');
    
    if (!lightBtn || !darkBtn) {
      return;
    }

    const savedTheme = this.storage.load('theme', 'light');
    
    const setTheme = (theme) => {
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        darkBtn.classList.add('theme-btn--active');
        lightBtn.classList.remove('theme-btn--active');
      } else {
        document.body.classList.remove('dark-theme');
        lightBtn.classList.add('theme-btn--active');
        darkBtn.classList.remove('theme-btn--active');
      }
      this.storage.save('theme', theme);
    };

    setTheme(savedTheme);

    lightBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setTheme('light');
    });
    darkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setTheme('dark');
    });

    if (headerToggle) {
      headerToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const currentTheme = this.storage.load('theme', 'light');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
      });
    }
  }

  setupPainTypeSelector() {
    const selector = document.getElementById('painTypeSelector');
    if (!selector) return;

    selector.innerHTML = '';
    selector.className = 'pain-type-selector';

    Object.entries(this.surveyConfig).forEach(([painType, config]) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'pain-type-card';
      card.innerHTML = `
        <div class="pain-type-card-icon">${config.icon}</div>
        <div class="pain-type-card-title">${config.name}</div>
        <div class="pain-type-card-description">${config.description}</div>
      `;
      card.addEventListener('click', () => this.selectPainType(painType));
      selector.appendChild(card);
    });
  }

  async selectPainType(painType) {
    this.currentPainType = painType;
    this.currentQuestionIndex = 0;
    this.currentSurveyAnswers = {};
    this.visibleQuestions = [];

    const config = this.surveyConfig[painType];

    document.getElementById('painTypeSelector').style.display = 'none';
    document.getElementById('surveyForm').style.display = 'block';
    document.getElementById('selectedPainTitle').textContent = config.name;

    const backBtn = document.getElementById('backToTypeSelect');
    backBtn.removeEventListener('click', this.handleBackClick);
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.resetSurvey();
    });

    this.buildVisibleQuestions(config);
    this.potentialQuestions = this.buildPotentialQuestions(config);
    await this.showNextQuestion();
  }

  buildVisibleQuestions(config) {
    this.visibleQuestions = [];
    config.questions.forEach(question => {
      if (!question.condition || question.condition(this.currentSurveyAnswers)) {
        this.visibleQuestions.push(question);
      }
    });
  }

  buildPotentialQuestions(config) {
    const potentialAnswers = { ...this.currentSurveyAnswers };
    const firstQuestion = config.questions[0];
    if (firstQuestion && firstQuestion.type === 'yesno' && !firstQuestion.condition) {
      potentialAnswers[firstQuestion.id] = true;
    }

    const potential = [];
    config.questions.forEach(question => {
      if (!question.condition || question.condition(potentialAnswers)) {
        potential.push(question);
      }
    });
    return potential;
  }

  async showNextQuestion() {
    const container = document.getElementById('surveyQuestionsContainer');
    container.innerHTML = '';

    if (this.currentQuestionIndex >= this.visibleQuestions.length) {
      await this.finalizeSurvey();
      return;
    }

    const question = this.visibleQuestions[this.currentQuestionIndex];
    const progressPercent = ((this.currentQuestionIndex + 1) / this.potentialQuestions.length) * 100;

    const progressBar = document.createElement('div');
    progressBar.className = 'survey-progress';
    progressBar.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercent}%"></div>
      </div>
      <span class="progress-text">${this.currentQuestionIndex + 1} из ${this.potentialQuestions.length}</span>
    `;
    container.appendChild(progressBar);

    const group = document.createElement('div');
    group.className = 'form__group form__group--single-question';

    const label = document.createElement('label');
    label.className = 'form__label form__label--large';
    label.textContent = question.label;
    group.appendChild(label);

    let input;

    switch (question.type) {
      case 'yesno':
        input = this.createYesNoInput(question);
        break;
      case 'scale1to10':
        input = this.createScaleInput(question);
        break;
      case 'text':
        input = this.createTextInput(question);
        break;
      case 'multiselect':
        input = this.createMultiselectInput(question);
        break;
      default:
        input = this.createTextInput(question);
    }

    group.appendChild(input);
    container.appendChild(group);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'survey-buttons';

    if (this.currentQuestionIndex > 0) {
      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'btn btn--secondary';
      prevBtn.textContent = '← Назад';
      prevBtn.addEventListener('click', () => this.showPreviousQuestion());
      buttonContainer.appendChild(prevBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn btn--primary';
    nextBtn.id = 'nextQuestionBtn';
    nextBtn.textContent = this.currentQuestionIndex === this.potentialQuestions.length - 1 ? 'Завершить' : 'Далее →';
    nextBtn.disabled = !question.optional;
    nextBtn.addEventListener('click', () => this.handleQuestionAnswer(question));
    
    if (!question.optional) {
      this.setupAnswerValidation(question, nextBtn);
    }
    
    buttonContainer.appendChild(nextBtn);

    container.appendChild(buttonContainer);
  }

  setupAnswerValidation(question, nextBtn) {
    const container = document.getElementById('surveyQuestionsContainer');
    
    if (question.type === 'yesno') {
      const buttons = document.querySelectorAll('.yesno-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          nextBtn.disabled = !document.querySelector('.yesno-btn.active');
        });
      });
    } else if (question.type === 'multiselect') {
      const checkboxes = document.querySelectorAll('.checkbox-label input');
      checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
          const anyChecked = Array.from(checkboxes).some(c => c.checked);
          nextBtn.disabled = !anyChecked;
        });
      });
    } else if (question.type === 'text') {
      const input = document.querySelector('.form__input');
      input.addEventListener('input', () => {
        nextBtn.disabled = !input.value.trim();
      });
    } else if (question.type === 'scale1to10') {
      nextBtn.disabled = false;
    }
  }

  async showPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      await this.showNextQuestion();
    }
  }

  async handleQuestionAnswer(question) {
    const container = document.getElementById('surveyQuestionsContainer');
    
    if (question.type === 'yesno') {
      const buttons = document.querySelectorAll('.yesno-btn');
      let answer = null;
      buttons.forEach(btn => {
        if (btn.classList.contains('active')) {
          answer = btn.dataset.value === 'true';
        }
      });
      if (answer === null && !question.optional) {
        this.showValidationError(container, 'Пожалуйста, выберите ответ');
        return;
      }
      this.clearValidationError(container);
      this.currentSurveyAnswers[question.id] = answer;
    } else if (question.type === 'scale1to10') {
      const input = document.querySelector('.scale-input');
      this.clearValidationError(container);
      this.currentSurveyAnswers[question.id] = parseInt(input.value);
    } else if (question.type === 'text') {
      const input = document.querySelector('.form__input');
      const value = input.value.trim();
      if (!value && !question.optional) {
        this.showValidationError(container, 'Пожалуйста, заполните поле');
        return;
      }
      this.clearValidationError(container);
      this.currentSurveyAnswers[question.id] = value || null;
    } else if (question.type === 'multiselect') {
      const checkboxes = document.querySelectorAll('.checkbox-label input');
      const selected = [];
      checkboxes.forEach(cb => {
        if (cb.checked) {
          selected.push(cb.value);
        }
      });
      if (selected.length === 0 && !question.optional) {
        this.showValidationError(container, 'Пожалуйста, выберите хотя бы один вариант');
        return;
      }
      this.clearValidationError(container);
      this.currentSurveyAnswers[question.id] = selected.length > 0 ? selected : null;
    }

    this.currentQuestionIndex++;
    const config = this.surveyConfig[this.currentPainType];
    this.buildVisibleQuestions(config);
    await this.showNextQuestion();
  }

  showValidationError(container, message) {
    this.clearValidationError(container);
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    const group = container.querySelector('.form__group');
    if (group) {
      group.insertBefore(errorElement, group.firstChild);
    }
  }

  clearValidationError(container) {
    const existingError = container.querySelector('.form-error');
    if (existingError) {
      existingError.remove();
    }
  }

  async finalizeSurvey() {
    const container = document.getElementById('surveyQuestionsContainer');
    container.innerHTML = `
      <div class="survey-complete">
        <h3>✅ Опрос завершён!</h3>
        <p>Спасибо за заполнение анкеты. Ваши данные сохранены.</p>
      </div>
    `;

    const weather = await this.getWeatherForSurvey();

    const survey = this.painSurvey.addSurvey({
      painType: this.currentPainType,
      answers: this.currentSurveyAnswers,
      weather: weather
    });

    this.storage.save('surveys', this.painSurvey.getAll());
    this.renderCalendar();

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'survey-buttons';

    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'btn btn--primary';
    backBtn.textContent = 'К выбору боли';
    backBtn.addEventListener('click', () => this.resetSurvey());
    buttonContainer.appendChild(backBtn);

    container.appendChild(buttonContainer);
  }

  resetSurvey() {
    this.currentQuestionIndex = 0;
    this.currentSurveyAnswers = {};
    this.visibleQuestions = [];
    this.potentialQuestions = [];
    this.currentPainType = null;

    document.getElementById('surveyForm').style.display = 'none';
    document.getElementById('painTypeSelector').style.display = 'grid';
    document.getElementById('surveyQuestionsContainer').innerHTML = '';
  }

  createYesNoInput(question) {
    const div = document.createElement('div');
    div.className = 'form-group-yesno';

    const yesBtn = document.createElement('button');
    yesBtn.type = 'button';
    yesBtn.className = 'yesno-btn';
    yesBtn.textContent = 'Да';
    yesBtn.dataset.value = 'true';
    yesBtn.addEventListener('click', () => {
      yesBtn.classList.toggle('active');
      noBtn.classList.remove('active');
      question.value = yesBtn.classList.contains('active') ? true : null;
    });

    const noBtn = document.createElement('button');
    noBtn.type = 'button';
    noBtn.className = 'yesno-btn';
    noBtn.textContent = 'Нет';
    noBtn.dataset.value = 'false';
    noBtn.addEventListener('click', () => {
      noBtn.classList.toggle('active');
      yesBtn.classList.remove('active');
      question.value = noBtn.classList.contains('active') ? false : null;
    });

    div.appendChild(yesBtn);
    div.appendChild(noBtn);
    return div;
  }

  createScaleInput(question) {
    const div = document.createElement('div');
    div.className = 'form-group-scale';

    const input = document.createElement('input');
    input.type = 'range';
    input.min = '1';
    input.max = '10';
    input.value = '5';
    input.className = 'scale-input';
    input.id = question.id;

    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'scale-value';
    valueDisplay.textContent = '5';

    input.addEventListener('input', () => {
      valueDisplay.textContent = input.value;
      question.value = parseInt(input.value);
    });

    div.appendChild(input);
    div.appendChild(valueDisplay);
    return div;
  }

  createTextInput(question) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form__input';
    input.id = question.id;
    input.placeholder = question.optional ? 'Опционально' : '';
    input.addEventListener('input', (e) => {
      question.value = e.target.value;
    });
    return input;
  }

  createMultiselectInput(question) {
    const div = document.createElement('div');
    div.className = 'form-group-multiselect';

    question.value = [];

    question.options.forEach(option => {
      const label = document.createElement('label');
      label.className = 'checkbox-label';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = option;
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          if (!question.value.includes(option)) {
            question.value.push(option);
          }
        } else {
          question.value = question.value.filter(v => v !== option);
        }
      });

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(option));
      div.appendChild(label);
    });

    return div;
  }

  async getWeatherForSurvey() {
    if (!this.healthAPI) return null;
    try {
      const weather = await this.healthAPI.getWeatherForCurrentLocation();
      return weather;
    } catch (error) {
      console.error('Error getting weather:', error);
      return null;
    }
  }

  setupSettingsForm() {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) return;

    const profile = this.userProfile.getProfile();

    document.getElementById('userName').value = profile.name || '';

    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const updatedProfile = {
        name: document.getElementById('userName').value
      };

      this.userProfile.updateProfile(updatedProfile);
    });

    this.setupNotifications();
    this.setupCitySelector();
  }

  setupNotifications() {
    const reminderToggle = document.getElementById('dailyReminderToggle');
    if (!reminderToggle) return;

    const reminderEnabled = this.storage.load('dailyReminder', true);
    reminderToggle.checked = reminderEnabled;

    reminderToggle.addEventListener('change', () => {
      this.storage.save('dailyReminder', reminderToggle.checked);
    });
  }

  setupCitySelector() {
    const citySelect = document.getElementById('citySelect');
    const saveCityBtn = document.getElementById('saveCityBtn');
    const geoStatus = document.getElementById('geoStatus');

    if (!citySelect || !saveCityBtn) return;

    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
      citySelect.value = savedCity;
      geoStatus.textContent = '✅ Город сохранён: ' + this.getCityName(savedCity);
    }

    saveCityBtn.addEventListener('click', () => {
      const selectedValue = citySelect.value;

      if (selectedValue === '') {
        localStorage.removeItem('selectedCity');
        geoStatus.textContent = '🌍 Будет использоваться автоматическое определение';
        alert('Геолокация: автоматическое определение');
      } else {
        localStorage.setItem('selectedCity', selectedValue);
        const cityName = this.getCityName(selectedValue);
        geoStatus.textContent = '✅ Город сохранён: ' + cityName;
        alert(`Город сохранён: ${cityName}`);
      }

      if (this.healthAPI) {
        this.healthAPI.savedLocation = this.healthAPI.getSavedLocation();
      }
    });
  }

  getCityName(coords) {
    const cityMap = {
      '55.7558,37.6173': 'Москва',
      '59.9311,30.3609': 'Санкт-Петербург',
      '54.7034,20.5109': 'Калининград',
      '56.2965,43.9676': 'Нижний Новгород',
      '51.5272,46.0153': 'Пенза',
      '54.1961,37.6212': 'Тула',
      '52.2977,104.2964': 'Иркутск',
      '55.1644,61.4368': 'Екатеринбург',
      '53.3475,83.7741': 'Новосибирск',
      '61.5240,105.2874': 'Якутск'
    };
    return cityMap[coords] || coords;
  }

  setupDataManagement() {
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    const clearBtn = document.getElementById('clearBtn');

    if (!exportBtn) return;

    exportBtn.addEventListener('click', () => {
      const data = {
        surveys: this.painSurvey.getAll(),
        profile: this.userProfile.getProfile(),
        exportDate: new Date().toISOString()
      };

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `health-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    });

    if (importBtn) {
      importBtn.addEventListener('click', () => {
        importFile.click();
      });
    }

    if (importFile) {
      importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (data.surveys) {
              this.painSurvey.setAll(data.surveys);
              this.storage.save('surveys', data.surveys);
            }
            if (data.profile) {
              this.userProfile.updateProfile(data.profile);
            }
            this.renderCalendar();
          } catch (error) {
          }
        };
        reader.readAsText(file);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Вы уверены? Это действие нельзя отменить!')) {
          this.storage.clear();
          this.painSurvey.clear();
          this.renderCalendar();
          alert('Все данные удалены!');
        }
      });
    }
  }

  renderCalendar() {
    const monthYear = document.getElementById('calendarMonthYear');
    const calendarBody = document.getElementById('calendarBody');
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    if (!monthYear || !calendarBody) return;

    const drawCalendar = () => {
      const year = this.surveyCalendar.currentDate.getFullYear();
      const month = this.surveyCalendar.currentDate.getMonth();

      monthYear.textContent = this.surveyCalendar.getMonthName();

      const firstDay = this.surveyCalendar.getFirstDayOfMonth(month, year);
      const daysCount = this.surveyCalendar.getDaysInMonth(month, year);
      const surveys = this.painSurvey.getAll();

      calendarBody.innerHTML = '';

      let dayCounter = 1;
      for (let week = 0; week < 6; week++) {
        const row = document.createElement('tr');

        for (let day = 0; day < 7; day++) {
          const cell = document.createElement('td');
          cell.className = 'calendar-day';

          if (week === 0 && day < firstDay) {
            cell.textContent = '';
          } else if (dayCounter > daysCount) {
            cell.textContent = '';
          } else {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
            const hasSurvey = this.surveyCalendar.hasSubmissionForDate(dateString, surveys);

            cell.textContent = dayCounter;
            cell.className = hasSurvey ? 'calendar-day has-survey' : 'calendar-day';

            if (hasSurvey) {
              cell.style.cursor = 'pointer';
              cell.addEventListener('click', () => this.showDateSubmissions(dateString));
            }

            dayCounter++;
          }

          row.appendChild(cell);
        }

        calendarBody.appendChild(row);
        if (dayCounter > daysCount) break;
      }
    };

    const handlePrevMonth = () => {
      this.surveyCalendar.previousMonth();
      drawCalendar();
    };

    const handleNextMonth = () => {
      this.surveyCalendar.nextMonth();
      drawCalendar();
    };

    prevBtn.onclick = handlePrevMonth;
    nextBtn.onclick = handleNextMonth;

    drawCalendar();
  }

  showDateSubmissions(dateString) {
    const submissionsForDate = this.painSurvey.getSurveysForDate(dateString);

    const title = document.getElementById('selectedDateTitle');
    const container = document.getElementById('submissionsContainer');
    const submissions = document.getElementById('selectedDateSubmissions');

    if (!title || !container || !submissions) return;

    const date = new Date(dateString + 'T00:00:00');
    title.textContent = `${date.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

    container.innerHTML = '';

    if (submissionsForDate.length === 0) {
      container.innerHTML = '<p>Нет опросов на эту дату</p>';
    } else {
      submissionsForDate.forEach(survey => {
        const config = this.surveyConfig[survey.painType];
        const surveyEl = document.createElement('div');
        surveyEl.className = 'survey-item';

        let answersHtml = '<ul class="survey-answers">';
        config.questions.forEach(question => {
          const answer = survey.answers[question.id];
          if (answer !== null && answer !== undefined && answer !== '') {
            const answerText = Array.isArray(answer) ? answer.join(', ') : answer;
            answersHtml += `<li><strong>${question.label}:</strong> ${answerText}</li>`;
          }
        });
        answersHtml += '</ul>';

        let weatherHtml = '';
        if (survey.weather) {
          weatherHtml = `
            <div class="survey-weather">
              <h5>Погода на момент опроса:</h5>
              <div class="weather-info">
                <div class="weather-item"><span class="weather-label">🌡️ Температура:</span> ${survey.weather.temperature}°C</div>
                <div class="weather-item"><span class="weather-label">💧 Влажность:</span> ${survey.weather.humidity}%</div>
                <div class="weather-item"><span class="weather-label">🔽 Давление:</span> ${survey.weather.pressure} hPa</div>
                <div class="weather-item"><span class="weather-label">💨 Ветер:</span> ${survey.weather.windSpeed} м/с</div>
                <div class="weather-item"><span class="weather-label">☁️ Облачность:</span> ${survey.weather.cloudiness}%</div>
              </div>
            </div>
          `;
        }

        surveyEl.innerHTML = `
          <div class="survey-day-header">
            <h4>${config.icon} ${config.name}</h4>
            <span class="survey-time">${new Date(survey.date).toLocaleTimeString('ru-RU')}</span>
          </div>
          ${answersHtml}
          ${weatherHtml}
        `;

        container.appendChild(surveyEl);
      });
    }

    submissions.style.display = 'block';

    document.getElementById('closeDateView').removeEventListener('click', this.handleCloseClick);
    document.getElementById('closeDateView').addEventListener('click', () => {
      submissions.style.display = 'none';
    });
  }

  loadSurveysFromStorage() {
    const savedSurveys = this.storage.load('surveys', []);
    if (savedSurveys.length > 0) {
      this.painSurvey.setAll(savedSurveys);
    }
  }

  checkDailyNotification() {
    const reminderEnabled = this.storage.load('dailyReminder', true);
    if (!reminderEnabled) return;

    const lastNotification = this.storage.load('lastNotificationDate', null);
    const today = new Date().toDateString();

    if (lastNotification !== today) {
      setTimeout(() => {
        alert('📋 Не забудьте пройти ежедневный опрос о своих болевых ощущениях!');
        this.storage.save('lastNotificationDate', today);
      }, 5000);
    }
  }

  async loadAnalysis() {
    const container = document.getElementById('analysisContainer');
    if (!container) return;

    const select = document.getElementById('painTypeFilter');
    if (!select.hasEventListener) {
      select.hasEventListener = true;
      select.addEventListener('change', () => this.renderAnalysis());
    }

    this.populatePainTypeSelect();
    this.renderAnalysis();
  }

  populatePainTypeSelect() {
    const select = document.getElementById('painTypeFilter');
    if (!select) return;

    const existingOptions = select.querySelectorAll('option:not(:first-child)');
    existingOptions.forEach(opt => opt.remove());

    Object.entries(this.surveyConfig).forEach(([key, config]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = config.name;
      select.appendChild(option);
    });
  }

  renderAnalysis() {
    const container = document.getElementById('analysisContainer');
    const select = document.getElementById('painTypeFilter');
    const selectedPainType = select?.value || null;

    if (!selectedPainType) {
      this.renderAllTypesAnalysis(container);
    } else {
      this.renderSingleTypeAnalysis(container, selectedPainType);
    }
  }

  renderAllTypesAnalysis(container) {
    container.innerHTML = '';
    
    const stats = {};
    Object.keys(this.surveyConfig).forEach(painType => {
      stats[painType] = this.analyticsManager.getStatisticsForType(painType);
    });

    const statsCard = document.createElement('div');
    statsCard.className = 'analysis-card';
    statsCard.innerHTML = `
      <h2 class="analysis-card__title">Сводная статистика по всем типам</h2>
      <div class="analysis-card__content stats-grid">
        ${Object.entries(stats).map(([painType, stat]) => `
          <div class="stat-item">
            <div class="stat-label">${this.surveyConfig[painType].name}</div>
            <div class="stat-value">${stat.totalSurveys}</div>
            <div class="stat-sublabel">опросов • ${stat.painFrequency}% с болью</div>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(statsCard);
  }

  renderSingleTypeAnalysis(container, painType) {
    container.innerHTML = '';
    const stats = this.analyticsManager.getStatisticsForType(painType);
    const config = this.surveyConfig[painType];

    if (stats.totalSurveys === 0) {
      container.innerHTML = `
        <div class="analysis-card">
          <p>Нет данных для этого типа боли</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="analysis-card analysis-card--full">
        <h2 class="analysis-card__title">Основная статистика: ${config.name}</h2>
        <div class="analysis-stats-grid">
          <div class="stat-box">
            <div class="stat-box__label">Всего опросов</div>
            <div class="stat-box__value">${stats.totalSurveys}</div>
          </div>
          <div class="stat-box">
            <div class="stat-box__label">С наличием боли</div>
            <div class="stat-box__value">${stats.surveysWithPain}</div>
          </div>
          <div class="stat-box">
            <div class="stat-box__label">Частота боли</div>
            <div class="stat-box__value">${stats.painFrequency}%</div>
          </div>
          <div class="stat-box">
            <div class="stat-box__label">Средняя интенсивность</div>
            <div class="stat-box__value">${stats.averageIntensity}</div>
          </div>
          <div class="stat-box">
            <div class="stat-box__label">Медиана интенсивности</div>
            <div class="stat-box__value">${stats.medianIntensity}</div>
          </div>
          <div class="stat-box">
            <div class="stat-box__label">Максимальная</div>
            <div class="stat-box__value">${stats.maxIntensity}</div>
          </div>
          <div class="stat-box">
            <div class="stat-box__label">Минимальная</div>
            <div class="stat-box__value">${stats.minIntensity}</div>
          </div>
        </div>
      </div>

      <div class="analysis-card">
        <h2 class="analysis-card__title">Текущая погода и рекомендации</h2>
        <div id="weatherCard" class="weather-card"></div>
      </div>

      <div class="analysis-card">
        <h2 class="analysis-card__title">Распределение интенсивности</h2>
        <div id="intensityChart" class="chart-container"></div>
      </div>

      <div class="analysis-card">
        <h2 class="analysis-card__title">Тренд боли (последние 30 дней)</h2>
        <div id="trendChart" class="chart-container"></div>
      </div>

      <div class="analysis-card">
        <h2 class="analysis-card__title">Боль по дням недели</h2>
        <div id="dayOfWeekChart" class="chart-container"></div>
      </div>

      <div class="analysis-card">
        <h2 class="analysis-card__title">Боль по часам суток</h2>
        <div id="hourChart" class="chart-container"></div>
      </div>

      <div class="analysis-card">
        <h2 class="analysis-card__title">Частые препараты</h2>
        <div id="medicationsChart" class="chart-container"></div>
      </div>

      <div class="analysis-card">
        <h2 class="analysis-card__title">Корреляция боли с погодой</h2>
        <div id="weatherCorrelationCharts" class="chart-container"></div>
      </div>

      <div class="analysis-card">
        <h2 class="analysis-card__title">Погодные триггеры</h2>
        <div id="weatherTriggersChart" class="chart-container"></div>
      </div>
    `;

    this.renderIntensityChart(painType);
    this.renderTrendChart(painType);
    this.renderDayOfWeekChart(painType);
    this.renderHourChart(painType);
    this.renderMedicationsChart(painType);
    this.renderWeatherCorrelationCharts(painType);
    this.renderWeatherTriggersChart(painType);
    this.renderWeatherCard(painType);
  }

  renderIntensityChart(painType) {
    const distribution = this.analyticsManager.getIntensityDistribution(painType);
    const container = document.getElementById('intensityChart');
    
    if (!container) return;
    
    const maxValue = Math.max(...Object.values(distribution), 1);
    const chartHTML = Object.entries(distribution).map(([intensity, count]) => {
      const percentage = (count / maxValue) * 100;
      const height = Math.max(percentage * 1.5, 5);
      return `
        <div class="chart-bar">
          <div class="chart-bar__label">${intensity}</div>
          <div class="chart-bar__container">
            <div class="chart-bar__fill" style="height: ${height}px;">
              ${count > 0 ? `<span class="chart-bar__value">${count}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="chart-bars">${chartHTML}</div>`;
  }

  renderTrendChart(painType) {
    const trendData = this.analyticsManager.getTrendData(painType, 30);
    const container = document.getElementById('trendChart');
    
    if (!container) return;
    
    const maxValue = Math.max(...trendData.map(d => d.count), 1);
    const chartHTML = trendData.map(item => {
      const percentage = (item.count / maxValue) * 100;
      const date = new Date(item.date);
      const label = date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
      return `
        <div class="chart-point" title="${label}: ${item.count} опросов">
          <div class="chart-point__bar" style="height: ${Math.max(percentage, 5)}%;" data-value="${item.count}" data-label="${label}"></div>
          <div class="chart-point__label">${label}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="chart-timeline">${chartHTML}</div>`;
    this.setupChartTooltips(container);
  }

  renderDayOfWeekChart(painType) {
    const dayData = this.analyticsManager.getPainDayOfWeek(painType);
    const container = document.getElementById('dayOfWeekChart');
    
    if (!container) return;
    
    const maxValue = Math.max(...Object.values(dayData), 1);
    const chartHTML = Object.entries(dayData).map(([day, count]) => {
      const percentage = (count / maxValue) * 100;
      const height = Math.max(percentage * 1.5, 5);
      return `
        <div class="chart-bar">
          <div class="chart-bar__label">${day}</div>
          <div class="chart-bar__container">
            <div class="chart-bar__fill" style="height: ${height}px;">
              ${count > 0 ? `<span class="chart-bar__value">${count}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="chart-bars">${chartHTML}</div>`;
  }

  renderHourChart(painType) {
    const hourData = this.analyticsManager.getPainByHour(painType);
    const container = document.getElementById('hourChart');
    
    if (!container) return;
    
    const maxValue = Math.max(...Object.values(hourData), 1);
    const chartHTML = Object.entries(hourData).map(([hour, count]) => {
      const percentage = (count / maxValue) * 100;
      return `
        <div class="chart-point" title="${hour}:00 - ${count} опросов">
          <div class="chart-point__bar" style="height: ${Math.max(percentage, 5)}%; " data-value="${count}" data-label="${hour}:00"></div>
          <div class="chart-point__label">${hour}:00</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="chart-timeline chart-timeline--hours">${chartHTML}</div>`;
    this.setupChartTooltips(container);
  }

  renderMedicationsChart(painType) {
    const medications = this.analyticsManager.getTopMedications(painType);
    const container = document.getElementById('medicationsChart');
    
    if (!container) return;
    
    if (medications.length === 0) {
      container.innerHTML = '<p>Нет данных о препаратах</p>';
      return;
    }

    const maxValue = Math.max(...medications.map(m => m.count), 1);
    const chartHTML = medications.map(item => {
      const percentage = (item.count / maxValue) * 100;
      const height = Math.max(percentage * 1.5, 5);
      return `
        <div class="chart-bar">
          <div class="chart-bar__label">${item.medication}</div>
          <div class="chart-bar__container">
            <div class="chart-bar__fill" style="height: ${height}px;">
              <span class="chart-bar__value">${item.count}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="chart-bars">${chartHTML}</div>`;
  }

  setupChartTooltips(container) {
    const bars = container.querySelectorAll('.chart-point__bar');
    const tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.style.display = 'none';
    tooltip.style.position = 'fixed';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = '#d4956e';
    tooltip.style.padding = '0.5rem 0.75rem';
    tooltip.style.borderRadius = '0';
    tooltip.style.fontSize = '0.85rem';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.zIndex = '1000';
    tooltip.style.border = '1px solid #d4956e';
    tooltip.style.fontFamily = "'Roboto Mono', monospace";
    document.body.appendChild(tooltip);

    bars.forEach(bar => {
      bar.addEventListener('mouseenter', (e) => {
        const value = bar.dataset.value;
        const label = bar.dataset.label;
        tooltip.textContent = `${label}: ${value}`;
        tooltip.style.display = 'block';
        
        const rect = bar.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = (rect.top - 40) + 'px';
      });

      bar.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });

      bar.addEventListener('click', () => {
        const value = bar.dataset.value;
        const label = bar.dataset.label;
        alert(`${label}: ${value} опросов`);
      });
    });
  }

  renderWeatherCorrelationCharts(painType) {
    const container = document.getElementById('weatherCorrelationCharts');
    if (!container) return;

    const surveys = this.analyticsManager.getSurveysByType(painType).filter(s => s.weather && s.answers.intensity !== undefined);
    
    if (surveys.length < 3) {
      container.innerHTML = '<p>Недостаточно данных для анализа корреляции</p>';
      return;
    }

    const factors = [
      { name: 'Температура (°C)', key: 'temperature', unit: '°C' },
      { name: 'Давление (hPa)', key: 'pressure', unit: 'hPa' },
      { name: 'Влажность (%)', key: 'humidity', unit: '%' }
    ];

    let chartsHTML = '';

    factors.forEach(factor => {
      const points = surveys.map(s => ({
        x: s.weather[factor.key],
        y: s.answers.intensity || 0
      })).filter(p => p.x !== undefined && p.y !== undefined);

      if (points.length === 0) return;

      const minX = Math.min(...points.map(p => p.x));
      const maxX = Math.max(...points.map(p => p.x));
      const minY = 0;
      const maxY = 10;

      const width = 300;
      const height = 200;
      const padding = 30;

      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;

      let pointsSVG = points.map(p => {
        const xPos = padding + ((p.x - minX) / (maxX - minX || 1)) * chartWidth;
        const yPos = padding + ((maxY - p.y) / (maxY - minY || 1)) * chartHeight;
        return `<circle cx="${xPos}" cy="${yPos}" r="4" fill="#d4956e" opacity="0.7" />`;
      }).join('');

      chartsHTML += `
        <div style="margin: 1rem 0; padding: 1rem; border: 1px solid var(--color-border); border-radius: 0;">
          <h3 style="font-size: 0.95rem; margin-bottom: 0.5rem;">${factor.name}</h3>
          <svg width="${width}" height="${height}" style="border: 1px solid var(--color-border-light);">
            <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="var(--color-border)" stroke-width="1"/>
            <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--color-border)" stroke-width="1"/>
            ${pointsSVG}
            <text x="${width / 2}" y="${height - 5}" text-anchor="middle" font-size="11" fill="var(--color-text-secondary)">${factor.name}</text>
            <text x="10" y="${height / 2}" text-anchor="middle" font-size="11" fill="var(--color-text-secondary)" transform="rotate(-90 10 ${height / 2})">Интенсивность</text>
          </svg>
          <p style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 0.5rem;">
            Корреляция: ${this.calculateCorrelation(points).toFixed(2)}
          </p>
        </div>
      `;
    });

    container.innerHTML = chartsHTML;
  }

  renderWeatherTriggersChart(painType) {
    const container = document.getElementById('weatherTriggersChart');
    if (!container) return;

    const surveys = this.analyticsManager.getSurveysByType(painType).filter(s => s.weather);
    
    if (surveys.length < 3) {
      container.innerHTML = '<p>Недостаточно данных для анализа триггеров</p>';
      return;
    }

    const triggers = [
      { label: 'Низкое давление\n(< 1010 hPa)', condition: (w) => w.pressure < 1010 },
      { label: 'Высокое давление\n(> 1020 hPa)', condition: (w) => w.pressure > 1020 },
      { label: 'Холодно (< 5°C)', condition: (w) => w.temperature < 5 },
      { label: 'Жарко (> 25°C)', condition: (w) => w.temperature > 25 },
      { label: 'Влажно (> 75%)', condition: (w) => w.humidity > 75 },
      { label: 'Сухо (< 40%)', condition: (w) => w.humidity < 40 }
    ];

    const triggerStats = triggers.map(trigger => {
      const matching = surveys.filter(s => trigger.condition(s.weather));
      const withPain = matching.filter(s => s.answers.had_pain === true);
      const avgIntensity = matching.length > 0 
        ? matching.reduce((sum, s) => sum + (s.answers.intensity || 0), 0) / matching.length 
        : 0;

      return {
        label: trigger.label,
        count: matching.length,
        withPain: withPain.length,
        avgIntensity: avgIntensity
      };
    }).filter(t => t.count > 0);

    if (triggerStats.length === 0) {
      container.innerHTML = '<p>Недостаточно данных для анализа триггеров</p>';
      return;
    }

    const maxIntensity = Math.max(...triggerStats.map(t => t.avgIntensity), 1);
    const chartHTML = triggerStats.map(item => {
      const percentage = (item.avgIntensity / maxIntensity) * 100;
      const height = Math.max(percentage * 1.5, 5);
      const painPercent = item.count > 0 ? Math.round((item.withPain / item.count) * 100) : 0;
      return `
        <div class="chart-bar">
          <div class="chart-bar__label">${item.label}</div>
          <div class="chart-bar__container">
            <div class="chart-bar__fill" style="height: ${height}px;" title="${item.count} случаев, ${painPercent}% с болью">
              <span class="chart-bar__value" style="font-size: 0.75rem;">${item.avgIntensity.toFixed(1)}</span>
            </div>
          </div>
          <div style="font-size: 0.7rem; color: var(--color-text-secondary); margin-top: 0.25rem;">
            ${item.count} случаев, ${painPercent}% с болью
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="chart-bars">${chartHTML}</div>`;
  }

  calculateCorrelation(points) {
    if (points.length < 2) return 0;

    const n = points.length;
    const sumX = points.reduce((s, p) => s + p.x, 0);
    const sumY = points.reduce((s, p) => s + p.y, 0);
    const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
    const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
    const sumY2 = points.reduce((s, p) => s + p.y * p.y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  renderWeatherCard(painType) {
    const bars = container.querySelectorAll('.chart-point__bar');
    const tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.style.display = 'none';
    tooltip.style.position = 'fixed';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = '#d4956e';
    tooltip.style.padding = '0.5rem 0.75rem';
    tooltip.style.borderRadius = '0';
    tooltip.style.fontSize = '0.85rem';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.zIndex = '1000';
    tooltip.style.border = '1px solid #d4956e';
    tooltip.style.fontFamily = "'Roboto Mono', monospace";
    document.body.appendChild(tooltip);

    bars.forEach(bar => {
      bar.addEventListener('mouseenter', (e) => {
        const value = bar.dataset.value;
        const label = bar.dataset.label;
        tooltip.textContent = `${label}: ${value}`;
        tooltip.style.display = 'block';
        
        const rect = bar.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = (rect.top - 40) + 'px';
      });

      bar.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });

      bar.addEventListener('click', () => {
        const value = bar.dataset.value;
        const label = bar.dataset.label;
        alert(`${label}: ${value} опросов`);
      });
    });
  }

  renderWeatherCard(painType) {
    const container = document.getElementById('weatherCard');
    if (!container) return;

    const surveys = this.analyticsManager.getSurveysByType(painType).filter(s => s.weather);
    
    if (surveys.length === 0) {
      container.innerHTML = '<p>Нет данных о погоде</p>';
      return;
    }

    // Получить последний опрос с погодой
    const lastSurveyWithWeather = surveys[surveys.length - 1];
    const weather = lastSurveyWithWeather.weather;

    // Вычислить средние значения погоды для этого типа боли
    let avgTemp = 0, avgHumidity = 0, avgPressure = 0;
    surveys.forEach(s => {
      avgTemp += s.weather.temperature;
      avgHumidity += s.weather.humidity;
      avgPressure += s.weather.pressure;
    });
    avgTemp = Math.round(avgTemp / surveys.length);
    avgHumidity = Math.round(avgHumidity / surveys.length);
    avgPressure = Math.round(avgPressure / surveys.length);

    // Рекомендации на основе погоды в зависимости от типа боли
    let recommendation = '';
    
    switch (painType) {
      case 'headache':
        if (avgPressure < 1010) {
          recommendation += '⚠️ Низкое давление часто вызывает головные боли. Пейте больше воды. ';
        }
        if (avgTemp < 0) {
          recommendation += '❄️ Перепады температуры могут спровоцировать мигрень. ';
        }
        break;

      case 'muscle':
        if (avgTemp < 5) {
          recommendation += '❄️ Холод усиливает мышечные боли - держитесь в тепле! ';
        }
        if (avgHumidity > 75) {
          recommendation += '💧 Высокая влажность может усилить мышечные боли. ';
        }
        break;

      case 'stomach':
        if (avgPressure < 1010) {
          recommendation += '⚠️ Низкое давление может влиять на ЖКТ. Ешьте легче. ';
        }
        if (avgTemp > 25) {
          recommendation += '🌡️ В жару следите за гидратацией и питанием. ';
        }
        break;

      case 'joint':
        if (avgHumidity > 75) {
          recommendation += '💧 Высокая влажность часто провоцирует боли в суставах. ';
        }
        if (avgPressure < 1010) {
          recommendation += '⚠️ Низкое давление усиливает суставные боли. ';
        }
        if (avgTemp < 10) {
          recommendation += '❄️ Холод - враг суставов. Согревайте суставы. ';
        }
        break;

      case 'back':
        if (avgTemp < 5) {
          recommendation += '❄️ Холод обостряет боли в спине. Держите спину в тепле. ';
        }
        if (avgHumidity > 70) {
          recommendation += '💧 Влажная погода может усилить боли в спине. ';
        }
        break;

      case 'menstrual':
        if (avgPressure < 1010) {
          recommendation += '⚠️ Низкое давление усиливает менструальные боли. ';
        }
        if (avgTemp < 10) {
          recommendation += '❄️ Держитесь в тепле - это помогает при менструальных спазмах. ';
        }
        break;

      default:
        if (avgPressure < 1010) {
          recommendation += '⚠️ Низкое давление часто связано с обострением болей. ';
        }
    }
    
    if (!recommendation) {
      recommendation = '✅ Погодные условия благоприятны для вашего здоровья.';
    }

    container.innerHTML = `
      <div class="weather-stats">
        <div class="weather-stat">
          <div class="weather-stat__label">Средняя температура</div>
          <div class="weather-stat__value">${avgTemp}°C</div>
        </div>
        <div class="weather-stat">
          <div class="weather-stat__label">Средняя влажность</div>
          <div class="weather-stat__value">${avgHumidity}%</div>
        </div>
        <div class="weather-stat">
          <div class="weather-stat__label">Среднее давление</div>
          <div class="weather-stat__value">${avgPressure} hPa</div>
        </div>
      </div>
      <div class="weather-recommendation">
        <h4>Рекомендация:</h4>
        <p>${recommendation}</p>
      </div>
    `;
  }
}

export default UIManager;
