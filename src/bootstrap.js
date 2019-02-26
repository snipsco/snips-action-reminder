const { configFactory, i18nFactory, httpFactory } = require('./factories')
const { loadAllReminders, enableAllReminders, destroyAllReminders } = require('./reminders')
const { destroyAllAlarm } = require('./alarms')
const { LANGUAGE_MAPPINGS } = require('./constants')

// Put anything that needs to be called on app. startup here.
module.exports = async (bootstrapOptions) => {
    configFactory.init()
    const config = configFactory.get(bootstrapOptions.config)
    const language = LANGUAGE_MAPPINGS[config.locale]
    await i18nFactory.init(language, bootstrapOptions.i18n)
    httpFactory.init(bootstrapOptions.http)

    loadAllReminders()
    enableAllReminders()

    process.on('SIGINT', function() {
        destroyAllReminders()
        destroyAllAlarm()
        process.exit()
    })
}