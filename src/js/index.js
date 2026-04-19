import StorageManager from './StorageManager.js';
import HealthMetrics from './HealthMetrics.js';
import UserProfile from './UserProfile.js';
import ChartRenderer from './ChartRenderer.js';
import PainSurvey from './PainSurvey.js';
import SurveyCalendar from './SurveyCalendar.js';
import SURVEY_CONFIG from './SurveyConfig.js';
import AnalyticsManager from './AnalyticsManager.js';
import HealthDataAPI from './HealthDataAPI.js';
import UIManager from './UIManager.js';

const storage = new StorageManager();
const healthMetrics = new HealthMetrics();
const userProfile = new UserProfile(storage);
const chartRenderer = new ChartRenderer();
const painSurvey = new PainSurvey();
const surveyCalendar = new SurveyCalendar();
const analyticsManager = new AnalyticsManager(painSurvey, SURVEY_CONFIG);
const healthAPI = new HealthDataAPI(window.WEATHER_PROXY_URL);
const uiManager = new UIManager(storage, healthMetrics, userProfile, healthAPI, chartRenderer, painSurvey, surveyCalendar, SURVEY_CONFIG, analyticsManager);

window.deleteMetric = (id) => {
  healthMetrics.removeMetric(id);
  storage.save('metrics', healthMetrics.getAll());
  uiManager.displayMetricsHistory();
};

window.deleteSurvey = (id) => {
  painSurvey.removeSurvey(id);
  storage.save('surveys', painSurvey.getAll());
};

document.addEventListener('DOMContentLoaded', () => {
  uiManager.initializeUI();
});
