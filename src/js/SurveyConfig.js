const SURVEY_CONFIG = {
  headache: {
    name: 'Головная боль',
    icon: '🧠',
    description: 'Головная боль влияет на концентрацию и качество жизни. Регулярное отслеживание помогает выявить триггеры и найти эффективное решение.',
    questions: [
      {
        id: 'had_pain',
        type: 'yesno',
        label: 'Была ли головная боль?'
      },
      {
        id: 'intensity',
        type: 'scale1to10',
        label: 'Уровень боли (1-10)',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'nausea',
        type: 'yesno',
        label: 'Тошнило ли?',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'light_sensitivity',
        type: 'yesno',
        label: 'Раздражал ли свет?',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'sound_sensitivity',
        type: 'yesno',
        label: 'Раздражали ли звуки?',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'medication',
        type: 'text',
        label: 'Какие препараты принимали?',
        optional: true,
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'pain_type',
        type: 'multiselect',
        label: 'Как болела голова?',
        options: ['Ныла', 'Пульсировала', 'Стреляла', 'Сжимающая', 'Жгучая'],
        condition: (answers) => answers.had_pain === true
      }
    ]
  },

  muscular: {
    name: 'Мышечная боль',
    icon: '💪',
    description: 'Мышечные боли ограничивают активность и снижают работоспособность. Отслеживание помогает связать боль с нагрузками и восстановлением.',
    questions: [
      {
        id: 'had_pain',
        type: 'yesno',
        label: 'Была ли мышечная боль?'
      },
      {
        id: 'intensity',
        type: 'scale1to10',
        label: 'Уровень боли (1-10)',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'location',
        type: 'text',
        label: 'Где болела мышца?',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'movement_restricted',
        type: 'yesno',
        label: 'Ограничена ли подвижность?',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'pain_type',
        type: 'multiselect',
        label: 'Характер боли',
        options: ['Ноющая', 'Острая', 'Спазматическая', 'Жгучая'],
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'medication',
        type: 'text',
        label: 'Какие препараты принимали?',
        optional: true,
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'trigger',
        type: 'text',
        label: 'Что её вызвало? (тренировка, работа и т.д.)',
        optional: true,
        condition: (answers) => answers.had_pain === true
      }
    ]
  },

  abdominal: {
    name: 'Боль в животе',
    icon: '🤢',
    description: 'Боли в животе могут указывать на проблемы с пищеварением или питанием. Мониторинг помогает выявить связь с едой и образом жизни.',
    questions: [
      {
        id: 'had_pain',
        type: 'yesno',
        label: 'Была ли боль в животе?'
      },
      {
        id: 'intensity',
        type: 'scale1to10',
        label: 'Уровень боли (1-10)',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'location',
        type: 'multiselect',
        label: 'Где болел живот?',
        options: ['Верхняя часть', 'Центр', 'Нижняя часть', 'По всему животу'],
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'accompanied_symptoms',
        type: 'multiselect',
        label: 'Сопутствующие симптомы',
        options: ['Тошнота', 'Рвота', 'Диарея', 'Запор', 'Вздутие'],
        optional: true,
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'pain_type',
        type: 'multiselect',
        label: 'Характер боли',
        options: ['Спазматическая', 'Ноющая', 'Острая', 'Тянущая'],
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'medication',
        type: 'text',
        label: 'Какие препараты принимали?',
        optional: true,
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'food_related',
        type: 'yesno',
        label: 'Связана ли с едой?',
        condition: (answers) => answers.had_pain === true
      }
    ]
  },

  backache: {
    name: 'Боль в спине',
    icon: '🔄',
    description: 'Боли в спине часто связаны с осанкой и нагрузками. Отслеживание поможет улучшить эргономику и выявить оптимальный уровень активности.',
    questions: [
      {
        id: 'had_pain',
        type: 'yesno',
        label: 'Была ли боль в спине?'
      },
      {
        id: 'intensity',
        type: 'scale1to10',
        label: 'Уровень боли (1-10)',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'location',
        type: 'multiselect',
        label: 'Где болела спина?',
        options: ['Верхняя часть', 'Средняя часть', 'Нижняя часть', 'По всей спине'],
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'movement_restricted',
        type: 'yesno',
        label: 'Ограничена ли подвижность?',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'pain_type',
        type: 'multiselect',
        label: 'Характер боли',
        options: ['Ноющая', 'Острая', 'Стреляющая', 'Тянущая'],
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'medication',
        type: 'text',
        label: 'Какие препараты принимали?',
        optional: true,
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'trigger',
        type: 'text',
        label: 'Причина (сидячая работа, спорт и т.д.)',
        optional: true,
        condition: (answers) => answers.had_pain === true
      }
    ]
  },

  joint: {
    name: 'Боль в суставах',
    icon: '🦴',
    description: 'Боли в суставах влияют на подвижность и качество жизни. Регулярный мониторинг помогает контролировать состояние и предотвращать обострения.',
    questions: [
      {
        id: 'had_pain',
        type: 'yesno',
        label: 'Была ли боль в суставах?'
      },
      {
        id: 'intensity',
        type: 'scale1to10',
        label: 'Уровень боли (1-10)',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'affected_joints',
        type: 'multiselect',
        label: 'Какие суставы?',
        options: ['Колено', 'Бедро', 'Плечо', 'Локоть', 'Запястье', 'Пальцы', 'Ступня', 'Другое'],
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'swelling',
        type: 'yesno',
        label: 'Отёк?',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'stiffness',
        type: 'yesno',
        label: 'Скованность по утрам?',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'pain_type',
        type: 'multiselect',
        label: 'Характер боли',
        options: ['Ноющая', 'Острая', 'Ломящая'],
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'medication',
        type: 'text',
        label: 'Какие препараты принимали?',
        optional: true,
        condition: (answers) => answers.had_pain === true
      }
    ]
  },

  dental: {
    name: 'Зубная боль',
    icon: '🦷',
    description: 'Зубные боли требуют внимания к гигиене и здоровью зубов. Отслеживание помогает связать боль с лечением и профилактикой.',
    questions: [
      {
        id: 'had_pain',
        type: 'yesno',
        label: 'Была ли зубная боль?'
      },
      {
        id: 'intensity',
        type: 'scale1to10',
        label: 'Уровень боли (1-10)',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'tooth_location',
        type: 'text',
        label: 'Какой зуб? (верхний/нижний, справа/слева и т.д.)',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'pain_triggers',
        type: 'multiselect',
        label: 'Что провоцирует боль?',
        options: ['Холод', 'Тепло', 'Жевание', 'Сладкое', 'Постоянная'],
        optional: true,
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'pain_type',
        type: 'multiselect',
        label: 'Характер боли',
        options: ['Острая', 'Ноющая', 'Пульсирующая'],
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'medication',
        type: 'text',
        label: 'Какие препараты принимали?',
        optional: true,
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'visited_dentist',
        type: 'yesno',
        label: 'Посетил(а) дантиста?',
        condition: (answers) => answers.had_pain === true
      }
    ]
  },

  chest: {
    name: 'Боль в груди',
    icon: '❤️',
    description: 'Боли в груди могут быть связаны со стрессом или физическими нагрузками. Систематический мониторинг помогает понять причины и улучшить здоровье.',
    questions: [
      {
        id: 'had_pain',
        type: 'yesno',
        label: 'Была ли боль в груди?'
      },
      {
        id: 'intensity',
        type: 'scale1to10',
        label: 'Уровень боли (1-10)',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'pain_type',
        type: 'multiselect',
        label: 'Характер боли',
        options: ['Острая', 'Ноющая', 'Давящая', 'Колющая'],
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'location',
        type: 'multiselect',
        label: 'Где боль?',
        options: ['Левая сторона', 'Правая сторона', 'Центр', 'По всей груди'],
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'breathing_difficult',
        type: 'yesno',
        label: 'Затруднено ли дыхание?',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'movement_dependent',
        type: 'yesno',
        label: 'Боль зависит от движения?',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'medication',
        type: 'text',
        label: 'Какие препараты принимали?',
        optional: true,
        condition: (answers) => answers.had_pain === true
      }
    ]
  },

  migraine: {
    name: 'Мигрень',
    icon: '⚡',
    description: 'Мигрени значительно снижают качество жизни. Детальный мониторинг поможет выявить триггеры и подобрать эффективное лечение.',
    questions: [
      {
        id: 'had_pain',
        type: 'yesno',
        label: 'Была ли мигрень?'
      },
      {
        id: 'intensity',
        type: 'scale1to10',
        label: 'Уровень боли (1-10)',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'location',
        type: 'multiselect',
        label: 'Где болела голова?',
        options: ['Левая сторона', 'Правая сторона', 'Обе стороны'],
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'aura',
        type: 'yesno',
        label: 'Была ли аура (вспышки, мушки в глазах)?',
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'symptoms',
        type: 'multiselect',
        label: 'Симптомы',
        options: ['Тошнота', 'Рвота', 'Светобоязнь', 'Звукобоязнь', 'Головокружение'],
        optional: true,
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'triggers',
        type: 'text',
        label: 'Возможный триггер (стресс, еда, погода и т.д.)',
        optional: true,
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'medication',
        type: 'text',
        label: 'Какие препараты принимали?',
        optional: true,
        condition: (answers) => answers.had_pain === true
      },
      {
        id: 'duration',
        type: 'text',
        label: 'Как долго длилась? (в часах)',
        condition: (answers) => answers.had_pain === true
      }
    ]
  }
};

export default SURVEY_CONFIG;
