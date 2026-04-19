import fs from 'fs';

const PAIN_TYPES = {
  headache: {
    name: 'Головная боль',
    questions: ['had_pain', 'intensity', 'nausea', 'light_sensitivity', 'sound_sensitivity', 'medication', 'pain_type']
  },
  muscular: {
    name: 'Мышечная боль',
    questions: ['had_pain', 'intensity', 'location', 'movement_restricted', 'pain_type', 'medication', 'trigger']
  },
  abdominal: {
    name: 'Боль в животе',
    questions: ['had_pain', 'intensity', 'location', 'accompanied_symptoms', 'pain_type', 'medication', 'food_related']
  },
  joint: {
    name: 'Боль в суставах',
    questions: ['had_pain', 'intensity', 'affected_joints', 'swelling', 'stiffness', 'pain_type', 'medication']
  },
  backache: {
    name: 'Боль в спине',
    questions: ['had_pain', 'intensity', 'location', 'movement_restricted', 'pain_type', 'medication', 'trigger']
  },
  migraine: {
    name: 'Мигрень',
    questions: ['had_pain', 'intensity', 'location', 'aura', 'symptoms', 'triggers', 'medication', 'duration']
  },
  dental: {
    name: 'Зубная боль',
    questions: ['had_pain', 'intensity', 'tooth_location', 'pain_triggers', 'pain_type', 'medication', 'visited_dentist']
  },
  chest: {
    name: 'Боль в груди',
    questions: ['had_pain', 'intensity', 'pain_type', 'location', 'breathing_difficult', 'movement_dependent', 'medication']
  }
};

const PAIN_DESCRIPTIONS = ['Ныла', 'Пульсировала', 'Стреляла', 'Сжимающая', 'Жгучая', 'Острая', 'Ломящая'];
const MEDICATIONS = ['Аспирин', 'Парацетамол', 'Ибупрофен', 'Диклофенак', 'Напроксен', 'Кетопрофен', 'Цитрамон', 'Суматриптан'];
const LOCATIONS = ['Спина', 'Поясница', 'Шея', 'Верхняя часть', 'Нижняя часть', 'Левая сторона', 'Правая сторона'];
const JOINTS = ['Колено', 'Лодыжка', 'Плечо', 'Локоть', 'Запястье', 'Тазобедренный сустав'];
const TRIGGERS = ['Стресс', 'Переутомление', 'Недосыпание', 'Физическая нагрузка', 'Поднятие тяжести', 'Длительная работа за компьютером'];
const SYMPTOMS = ['Тошнота', 'Светобоязнь', 'Звукобоязнь', 'Головокружение', 'Слабость'];
const TEETH = ['Верхний левый премоляр', 'Верхний правый премоляр', 'Нижний левый премоляр', 'Нижний правый премоляр'];
const PAIN_TRIGGERS_DENTAL = ['Холод', 'Жевание', 'Сладкое', 'Горячее'];

// Погода варьируется по дням
const WEATHER_PATTERNS = [
  { temperature: 5, humidity: 85, pressure: 1012, windSpeed: 3.2, cloudiness: 80, description: 'облачно', condition: 'Clouds' },
  { temperature: 8, humidity: 75, pressure: 1015, windSpeed: 2.1, cloudiness: 60, description: 'частично облачно', condition: 'Clouds' },
  { temperature: 12, humidity: 65, pressure: 1018, windSpeed: 1.5, cloudiness: 30, description: 'ясно', condition: 'Clear' },
  { temperature: 3, humidity: 90, pressure: 1010, windSpeed: 4.5, cloudiness: 95, description: 'дождь', condition: 'Rain' },
  { temperature: 2, humidity: 88, pressure: 1008, windSpeed: 5.2, cloudiness: 90, description: 'переменная облачность', condition: 'Clouds' },
  { temperature: 15, humidity: 60, pressure: 1020, windSpeed: 0.8, cloudiness: 10, description: 'солнечно', condition: 'Clear' },
  { temperature: 1, humidity: 92, pressure: 1005, windSpeed: 6.1, cloudiness: 100, description: 'снег', condition: 'Snow' },
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomItems(arr, min = 1, max = 3) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const result = [];
  const copy = [...arr];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

function generateWeather(dayOffset) {
  // Погода повторяется с некоторым периодом
  const patternIndex = (dayOffset + 3) % WEATHER_PATTERNS.length;
  const baseWeather = WEATHER_PATTERNS[patternIndex];
  
  // Добавляем небольшие вариации
  return {
    temperature: baseWeather.temperature + Math.floor(Math.random() * 3) - 1,
    humidity: Math.max(50, Math.min(100, baseWeather.humidity + Math.floor(Math.random() * 10) - 5)),
    pressure: baseWeather.pressure + Math.floor(Math.random() * 4) - 2,
    windSpeed: Math.max(0, baseWeather.windSpeed + (Math.random() - 0.5) * 2).toFixed(1),
    cloudiness: Math.max(0, Math.min(100, baseWeather.cloudiness + Math.floor(Math.random() * 20) - 10)),
    description: baseWeather.description,
    condition: baseWeather.condition,
    timestamp: Date.now()
  };
}

function generateSurveyAnswer(painType) {
  const hasPain = Math.random() > 0.3;
  const answers = { had_pain: hasPain };

  if (!hasPain) {
    return answers;
  }

  if (['headache', 'muscular', 'abdominal', 'joint', 'backache', 'migraine', 'dental', 'chest'].includes(painType)) {
    answers.intensity = Math.floor(Math.random() * 10) + 1;
  }

  switch (painType) {
    case 'headache':
      answers.nausea = Math.random() > 0.5;
      answers.light_sensitivity = Math.random() > 0.5;
      answers.sound_sensitivity = Math.random() > 0.5;
      answers.medication = getRandomItem(MEDICATIONS);
      answers.pain_type = getRandomItems(PAIN_DESCRIPTIONS, 1, 2);
      break;

    case 'muscular':
      answers.location = getRandomItem(LOCATIONS);
      answers.movement_restricted = Math.random() > 0.4;
      answers.pain_type = getRandomItems(PAIN_DESCRIPTIONS, 1, 2);
      answers.medication = getRandomItem(MEDICATIONS);
      answers.trigger = getRandomItem(TRIGGERS);
      break;

    case 'abdominal':
      answers.location = getRandomItem(LOCATIONS);
      answers.accompanied_symptoms = getRandomItems(SYMPTOMS, 0, 2);
      answers.pain_type = getRandomItems(PAIN_DESCRIPTIONS, 1, 2);
      answers.medication = getRandomItem(MEDICATIONS);
      answers.food_related = Math.random() > 0.5;
      break;

    case 'joint':
      answers.affected_joints = getRandomItems(JOINTS, 1, 2);
      answers.swelling = Math.random() > 0.5;
      answers.stiffness = Math.random() > 0.5;
      answers.pain_type = getRandomItems(PAIN_DESCRIPTIONS, 1, 2);
      answers.medication = getRandomItem(MEDICATIONS);
      break;

    case 'backache':
      answers.location = getRandomItems(LOCATIONS, 1, 2);
      answers.movement_restricted = Math.random() > 0.3;
      answers.pain_type = getRandomItems(PAIN_DESCRIPTIONS, 1, 2);
      answers.medication = getRandomItem(MEDICATIONS);
      answers.trigger = getRandomItem(TRIGGERS);
      break;

    case 'migraine':
      answers.location = getRandomItems(LOCATIONS, 1, 2);
      answers.aura = Math.random() > 0.6;
      answers.symptoms = getRandomItems(SYMPTOMS, 0, 3);
      answers.triggers = getRandomItem(TRIGGERS);
      answers.medication = getRandomItem(MEDICATIONS);
      answers.duration = `${Math.floor(Math.random() * 6) + 1} часов`;
      break;

    case 'dental':
      answers.tooth_location = getRandomItem(TEETH);
      answers.pain_triggers = getRandomItems(PAIN_TRIGGERS_DENTAL, 1, 2);
      answers.pain_type = getRandomItems(PAIN_DESCRIPTIONS, 1, 2);
      answers.medication = getRandomItem(MEDICATIONS);
      answers.visited_dentist = Math.random() > 0.7;
      break;

    case 'chest':
      answers.pain_type = getRandomItems(PAIN_DESCRIPTIONS, 1, 2);
      answers.location = getRandomItem(LOCATIONS);
      answers.breathing_difficult = Math.random() > 0.7;
      answers.movement_dependent = Math.random() > 0.5;
      answers.medication = getRandomItem(MEDICATIONS);
      break;
  }

  return answers;
}

function generateMockData(numDays = 90) {
  const surveys = [];
  const painTypeKeys = Object.keys(PAIN_TYPES);

  const now = new Date();
  const startDate = new Date(now.getTime() - numDays * 24 * 60 * 60 * 1000);

  for (let i = 0; i < numDays; i++) {
    const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const timestamp = Math.floor(currentDate.getTime() / 1000) * 1000;
    
    const surveysPerDay = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < surveysPerDay; j++) {
      const painType = getRandomItem(painTypeKeys);
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      
      const surveyDate = new Date(currentDate);
      surveyDate.setHours(hour, minute, 0, 0);
      
      const survey = {
        id: timestamp + j * 1000,
        date: surveyDate.toISOString(),
        timestamp: Math.floor(surveyDate.getTime() / 1000) * 1000,
        painType: painType,
        answers: generateSurveyAnswer(painType),
        weather: generateWeather(i)
      };
      
      surveys.push(survey);
    }
  }

  const mockData = {
    surveys: surveys,
    profile: {
      name: 'Иван Иванов',
      age: Math.floor(Math.random() * 40) + 20,
      height: Math.floor(Math.random() * 30) + 160,
      weight: Math.floor(Math.random() * 40) + 60
    },
    exportDate: new Date().toISOString()
  };

  return mockData;
}

const numDays = process.argv[2] ? parseInt(process.argv[2]) : 90;
const mockData = generateMockData(numDays);

fs.writeFileSync(
  '/Users/anoobis/unik/frontend/cursach/mock-data.json',
  JSON.stringify(mockData, null, 2)
);

