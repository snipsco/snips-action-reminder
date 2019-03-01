const { logger } = require('../utils')
const { extractSlots, flowContinueBuiltin } = require('./common')
const i18nFactory = require('../factories/i18nFactory')
const generateDatetimeTTS = require('../tts/generateDatetimeTTS')
const {
    getReminders,
    getReminderById,
    rescheduleReminderById
    //renameReminderById
} = require('../reminders')

module.exports = async function (msg, flow, knownSlots = { depth: 3 }) {
    logger.debug('rescheduleReminder')
    const i18n = i18nFactory.get()
    const slots = await extractSlots(msg, knownSlots)
    const reminders = getReminders(
        slots.reminder_name,
        slots.former_reminder_datetime,
        slots.recurrence
    )

    // One reminder found, new datetime provided
    if (reminders.length === 1 && slots.new_reminder_datetime) {
        logger.debug('One reminder found, new datetime provided')
        flow.end()
        const id = reminders[0].id
        rescheduleReminderById(id, slots.new_reminder_datetime)

        return i18n('rescheduleReminder.info.reminderRescheduled', {
            name: reminders[0].name,
            newDatetime: generateDatetimeTTS(getReminderById(id).datetime)
        })
    }

    // Reached the max re-try times
    if (knownSlots.depth === 0) {
        logger.debug('Reached the max re-try times')
        flow.end()
        return i18n('inform.doNotUnderstantd')
    }

    // No reminders, no slots
    if (!reminders.length && !Object.keys(slots).length) {
        logger.debug('No reminders, no slots')
        flow.end()
        return i18n('getReminders.info.noReminderFound')
    }

    // No reminders found, former_reminder_datetime or new_reminder_datetime provided
    if (!reminders.length && (slots.former_reminder_datetime || slots.new_reminder_datetime)) {
        logger.debug('No reminders found, former_reminder_datetime or new_reminder_datetime provided')
        flowContinueBuiltin(flow, knownSlots, require('./index').rescheduleReminder)
        flow.continue('snips-assistant:Yes', (msg, flow) => {
            slots.depth = 3
            return require('./index').setReminder(msg, flow, slots)
        })
        return i18n('rescheduleReminder.info.noReminderFound') + i18n('setReminder.ask.createReminder')
    }

    // One reminder found, new datetime not provided
    if (reminders.length === 1 && !slots.new_reminder_datetime) {
        logger.debug('One reminder found, new datetime not provided')
        slots.depth = knownSlots.depth - 1
        flowContinueBuiltin(flow, slots, require('./index').rescheduleReminder)
        flow.continue('snips-assistant:RescheduleReminder', (msg, flow) => {
            return require('./index').rescheduleReminder(msg, flow, slots)
        })
        return i18n('rescheduleReminder.ask.newReminderDatetime')
    }

    // Several reminders found
    if (reminders.length > 1) {
        logger.debug('Several reminders found')
        slots.depth = knownSlots.depth - 1
        flowContinueBuiltin(flow, slots, require('./index').rescheduleReminder)
        flow.continue('snips-assistant:RescheduleReminder', (msg, flow) => {
            return require('./index').rescheduleReminder(msg, flow, slots)
        })
        return i18n('getReminders.info.foundReminders', {
            number: reminders.length
        }) + i18n('rescheduleReminder.ask.whichToReschedule')
    }

    flow.end()
    return i18n('debug.caseNotRecognized')
}