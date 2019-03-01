module.exports = {
    DEFAULT_LOCALE: 'english',
    SUPPORTED_LOCALES: [
        'english',
        'french'
    ],
    DEFAULT_LANGUAGE: 'en',
    LANGUAGE_MAPPINGS: {
        english: 'en',
        french: 'fr'
    },
    INTENT_PROBABILITY_THRESHOLD: 0.2,
    INTENT_FILTER_PROBABILITY_THRESHOLD: 0,
    SLOT_CONFIDENCE_THRESHOLD: 0,
    ASR_TOKENS_CONFIDENCE_THRESHOLD: 0.2,
    RECURRENCE_TTS_MAP: {
        'mondays': 'every monday',
        'tuesdays': 'every tuesday',
        'wednesdays': 'every wednesday',
        'thursdays': 'every thursday',
        'fridays': 'every friday',
        'saturdays': 'every saturday',
        'sundays': 'every sunday',
        'monthly': 'every month',
        'daily': 'every day',
        'weekly': 'every week',
        'weekends': 'weekend'
    }
}