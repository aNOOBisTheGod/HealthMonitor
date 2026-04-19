class SurveyCalendar {
  constructor() {
    this.currentDate = new Date();
  }

  getCurrentMonth() {
    return this.currentDate.getMonth();
  }

  getCurrentYear() {
    return this.currentDate.getFullYear();
  }

  getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }

  getFirstDayOfMonth(month, year) {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
  }

  generateCalendarDays() {
    const month = this.getCurrentMonth();
    const year = this.getCurrentYear();
    const daysInMonth = this.getDaysInMonth(month, year);
    const firstDay = this.getFirstDayOfMonth(month, year);

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        fullDate: new Date(year, month, i),
        dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }

    return days;
  }

  getMonthName() {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return `${months[this.getCurrentMonth()]} ${this.getCurrentYear()}`;
  }

  getDayName(dayIndex) {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[dayIndex];
  }

  hasSubmissionForDate(dateString, surveys) {
    return surveys.some(survey => {
      const surveyDate = new Date(survey.date).toISOString().split('T')[0];
      return surveyDate === dateString;
    });
  }

  getSubmissionsForDate(dateString, surveys) {
    return surveys.filter(survey => {
      const surveyDate = new Date(survey.date).toISOString().split('T')[0];
      return surveyDate === dateString;
    });
  }
}

export default SurveyCalendar;
