const { logger, arrayIntersection, generateMessageForReminders } = require('../utils')
const i18nFactory = require('../factories/i18nFactory')
const { extractSlots, flowContinueBuiltin } = require('./common')
const {
    getReminders
} = require('../reminders')

module.exports = async function (msg, flow) {
    logger.debug('getReminder')
    const i18n = i18nFactory.get()
    const slots = await extractSlots(msg)
    const reminders = getReminders(
        slots.reminder_name,
        slots.datetime,
        slots.recurrence,
        slots.past_reminders ? true : false
    )

    // No reminders, no slots
    if (!reminders.length && !Object.keys(slots).length) {
        logger.debug('No reminders, no slots')
        flow.end()
        return i18n('getReminder.info.noReminderFound')
    }

    // No reminders, slots detected
    if (!reminders.length && Object.keys(slots).length) {
        logger.debug('No reminders, slots detected')
        flow.continue('snips-assistant:Yes', (msg, flow) => {
            slots.depth = 3
            return require('./index').setReminder(msg, flow, slots)
        })
        flow.continue('snips-assistant:No', (msg, flow) => {
            flow.end()
        })
        return i18n('getReminder.info.noReminderFound') + i18n('setReminder.ask.createReminder')
    }

    // Found reminders by using some of the constrains
    if (reminders.length) {
        logger.debug('Found reminders by using some of the constrains')
        flow.end()
        return generateMessageForReminders(reminders, slots.past_reminders ? true : false)
    }

    flow.end()
    return i18n('debug.caseNotRecognized')
}