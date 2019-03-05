const { logger, arrayIntersection, generateMessageForReminders } = require('../utils')
const i18nFactory = require('../factories/i18nFactory')
const { extractSlots, flowContinueBuiltin } = require('./common')
const generateDatetimeTTS = require('../tts/generateDatetimeTTS')
const {
    deleteReminderById,
    getReminders
} = require('../reminders')

module.exports = async function (msg, flow) {
    logger.debug('cancelReminder')
    const i18n = i18nFactory.get()
    const slots = await extractSlots(msg)
    const reminders = getReminders(
        slots.reminder_name,
        slots.datetime,
        slots.recurrence,
        slots.past_reminders ? true : false
    )

    // No reminders
    if (!reminders.length) {
        logger.debug('No reminders')
        flow.end()
        return i18n('getReminders.info.noReminderFound')
    }

    // Cancel all the found reminders
    if (reminders.length && slots.all_reminders) {
        logger.debug('Cancel all the found reminders')
        flow.continue('snips-assistant:Yes', (msg, flow) => {
            flow.end()
            reminders.forEach(reminder => {
                deleteReminderById(reminder.id)
            })
            return i18n('cancelReminder.info.confirmRemindersCancelled')
        })
        flow.continue('snips-assistant:No', (msg, flow) => {
            flow.end()
        })
        return i18n('getReminders.info.foundReminders', {
            number: reminders.length,
            odd: (reminders.length === 1) ? '' : 's' 
        }) + i18n ('cancelReminder.ask.confirmToCancelAll')
    }

    // Found reminders by using some of the constrains
    if (reminders.length === 1) {
        flow.continue('snips-assistant:Yes', (msg, flow) => {
            flow.end()
            deleteReminderById(reminders[0].id)
            return i18n('cancelReminder.info.confirmRemindersCancelled', {
                name: reminders[0].name
            })
        })
        flow.continue('snips-assistant:No', (msg, flow) => {
            flow.end()
        })
        return i18n('cancelReminder.ask.confirmToCancelReminder', {
            name: reminders[0].name,
            datetime: generateDatetimeTTS(reminders[0].datetime)
        })
    } else {
        flow.end()
        return i18n('cancelReminder.info.multiRemindersFound')
    }

    flow.end()
    return i18n('debug.caseNotRecognized')
}