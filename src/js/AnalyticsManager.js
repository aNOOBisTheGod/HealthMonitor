class AnalyticsManager {
  constructor(painSurvey, surveyConfig) {
    this.painSurvey = painSurvey;
    this.surveyConfig = surveyConfig;
  }

  getSurveysByType(painType) {
    return this.painSurvey.getAll().filter(survey => survey.painType === painType);
  }

  getStatisticsForType(painType) {
    const surveys = this.getSurveysByType(painType);
    const surveysWithPain = surveys.filter(s => s.answers.had_pain);

    return {
      totalSurveys: surveys.length,
      surveysWithPain: surveysWithPain.length,
      painFrequency: surveysWithPain.length > 0 ? (surveysWithPain.length / surveys.length * 100).toFixed(1) : 0,
      averageIntensity: this.getAverageIntensity(surveysWithPain),
      medianIntensity: this.getMedianIntensity(surveysWithPain),
      maxIntensity: this.getMaxIntensity(surveysWithPain),
      minIntensity: this.getMinIntensity(surveysWithPain)
    };
  }

  getAverageIntensity(surveys) {
    if (surveys.length === 0) return 0;
    const sum = surveys.reduce((acc, s) => acc + (s.answers.intensity || 0), 0);
    return (sum / surveys.length).toFixed(1);
  }

  getMedianIntensity(surveys) {
    if (surveys.length === 0) return 0;
    const intensities = surveys
      .map(s => s.answers.intensity)
      .filter(i => i !== undefined)
      .sort((a, b) => a - b);
    const mid = Math.floor(intensities.length / 2);
    return intensities.length % 2 ? intensities[mid] : ((intensities[mid - 1] + intensities[mid]) / 2).toFixed(1);
  }

  getMaxIntensity(surveys) {
    if (surveys.length === 0) return 0;
    return Math.max(...surveys.map(s => s.answers.intensity || 0));
  }

  getMinIntensity(surveys) {
    if (surveys.length === 0) return 0;
    return Math.min(...surveys.map(s => s.answers.intensity || 0));
  }

  getIntensityDistribution(painType) {
    const surveys = this.getSurveysByType(painType).filter(s => s.answers.had_pain);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };

    surveys.forEach(survey => {
      const intensity = survey.answers.intensity || 0;
      if (intensity >= 1 && intensity <= 10) {
        distribution[intensity]++;
      }
    });

    return distribution;
  }

  getTrendData(painType, days = 30) {
    const surveys = this.getSurveysByType(painType);
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const trendData = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];
      trendData[dateString] = 0;
    }

    surveys.forEach(survey => {
      const date = new Date(survey.timestamp);
      const dateString = date.toISOString().split('T')[0];
      if (trendData.hasOwnProperty(dateString) && survey.answers.had_pain) {
        trendData[dateString]++;
      }
    });

    return Object.entries(trendData).map(([date, count]) => ({ date, count }));
  }

  getPainDayOfWeek(painType) {
    const surveys = this.getSurveysByType(painType).filter(s => s.answers.had_pain);
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const distribution = { 'Пн': 0, 'Вт': 0, 'Ср': 0, 'Чт': 0, 'Пт': 0, 'Сб': 0, 'Вс': 0 };

    surveys.forEach(survey => {
      const date = new Date(survey.timestamp);
      const dayIndex = (date.getDay() + 6) % 7;
      distribution[daysOfWeek[dayIndex]]++;
    });

    return distribution;
  }

  getPainByHour(painType) {
    const surveys = this.getSurveysByType(painType).filter(s => s.answers.had_pain);
    const distribution = {};
    for (let i = 0; i < 24; i++) {
      distribution[i] = 0;
    }

    surveys.forEach(survey => {
      const date = new Date(survey.timestamp);
      const hour = date.getHours();
      distribution[hour]++;
    });

    return distribution;
  }

  getTopMedications(painType) {
    const surveys = this.getSurveysByType(painType).filter(s => s.answers.had_pain && s.answers.medication);
    const medications = {};

    surveys.forEach(survey => {
      const medication = survey.answers.medication;
      medications[medication] = (medications[medication] || 0) + 1;
    });

    return Object.entries(medications)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([medication, count]) => ({ medication, count }));
  }
}

export default AnalyticsManager;
