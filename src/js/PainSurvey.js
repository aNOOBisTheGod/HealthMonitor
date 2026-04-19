class PainSurvey {
  constructor() {
    this.painTypes = {
      headache: 'Головная боль',
      muscular: 'Мышечная боль',
      abdominal: 'Боль в животе',
      backache: 'Боль в спине',
      joint: 'Боль в суставах',
      dental: 'Зубная боль',
      chest: 'Боль в груди',
      migraine: 'Мигрень'
    };

    this.intensityLevels = {
      0: 'Нет',
      1: 'Слабая',
      2: 'Умеренная',
      3: 'Сильная',
      4: 'Очень сильная'
    };

    this.surveys = [];
    this.lastSurveyDate = null;
  }

  addSurvey(surveyData) {
    const survey = {
      id: Date.now(),
      date: new Date().toISOString(),
      timestamp: Date.now(),
      painType: surveyData.painType,
      answers: surveyData.answers,
      weather: surveyData.weather || null
    };

    this.surveys.push(survey);
    this.lastSurveyDate = new Date();
    return survey;
  }

  removeSurvey(id) {
    this.surveys = this.surveys.filter(s => s.id !== id);
  }

  getSurveysForDate(date) {
    const targetDate = new Date(date).toDateString();
    return this.surveys.filter(s => {
      const surveyDate = new Date(s.date).toDateString();
      return surveyDate === targetDate;
    });
  }

  getSurveysForPeriod(startDate, endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return this.surveys.filter(s => {
      const surveyTime = new Date(s.date).getTime();
      return surveyTime >= start && surveyTime <= end;
    });
  }

  getPainStatistics(painType) {
    const painSurveys = this.surveys.filter(s => s.pain[painType]);

    if (painSurveys.length === 0) return null;

    const intensities = painSurveys.map(s => s.pain[painType]);
    const avg = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const max = Math.max(...intensities);
    const min = Math.min(...intensities);
    const totalDays = painSurveys.length;
    const daysWith = painSurveys.filter(s => s.pain[painType] > 0).length;

    return {
      avgIntensity: avg.toFixed(1),
      maxIntensity: max,
      minIntensity: min,
      totalSurveys: painSurveys.length,
      daysWithPain: daysWith,
      frequency: ((daysWith / totalDays) * 100).toFixed(1)
    };
  }

  getTodaySurvey() {
    const today = new Date().toDateString();
    return this.surveys.find(s => new Date(s.date).toDateString() === today);
  }

  hasCompletedTodaySurvey() {
    return this.getTodaySurvey() !== undefined;
  }

  getAll() {
    return this.surveys;
  }

  setAll(surveys) {
    this.surveys = surveys;
  }

  clear() {
    this.surveys = [];
    this.lastSurveyDate = null;
  }
}

export default PainSurvey;
