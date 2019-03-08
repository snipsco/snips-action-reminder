const { logger } = require('../utils')
const { extractSlots, flowContinueBuiltin } = require('./common')
const generateReport = require('../tts/generateReport')
const i18nFactory = require('../factories/i18nFactory')
//const generateDatetimeTTS = require('../tts/generateDatetimeTTS')
const { getTimeHuman } = require('../tts/generateTime')
const { getCompletedDatetime } = require('../utils/parser')
const {
    getReminders,
    getReminderById,
    rescheduleReminderById
    //renameReminderById
} = require('../reminders')

module.exports = async function (msg, flow, knownSlots = { depth: 3 }, reminders = null) {
    logger.debug('rescheduleReminder')
    const i18n = i18nFactory.get()
    const slots = await extractSlots(msg, knownSlots)

    // Reached the max re-try times
    if (knownSlots.depth === 0) {
        logger.debug('Reached the max re-try times')
        flow.end()
        return i18n('inform.doNotUnderstantd')
    }

    if (!(slots.reminder_name || slots.former_reminder_datetime || slots.recurrence)) {
        logger.debug('No constrain')
        knownSlots.depth -= 1
        flowContinueBuiltin(flow, knownSlots, require('./index').rescheduleReminder)
        flow.continue('snips-assistant:RescheduleReminder', (msg, flow) => {
            return require('./index').rescheduleReminder(msg, flow, knownSlots)
        })
        return i18n('rescheduleReminder.ask.whichToReschedule')
    }

    if (!reminders) {
        const detectedSlots = {
            reminder_name: slots.reminder_name,
            datetime: slots.former_reminder_datetime,
            recurrence: slots.recurrence,
            depth: 3
        }
        return require('./index').getReminder(msg, flow, detectedSlots, (msg, flow, knownSlots, reminders) => {
            return require('./index').rescheduleReminder(msg, flow, knownSlots, reminders)
        })
    }

    const report = generateReport(reminders, slots)

    // One reminder found, new datetime provided
    if (reminders.length === 1 && slots.new_reminder_datetime) {
        logger.debug('One reminder found, new datetime provided')
        flow.end()

        if (!slots.recurrence) {
            const thisMoment = new Date(Date.now())
            const thatMoment = getCompletedDatetime(slots.new_reminder_datetime)

            if (thatMoment.getTime() < thisMoment.getTime() + 15000 && !slots.recurrence) {
                return i18n('common.error.pastReminderTime')
            }
        }

        const id = reminders[0].id
        rescheduleReminderById(id, slots.new_reminder_datetime)

        return i18n('rescheduleReminder.info.reminder_RescheduledTo_', {
            name: reminders[0].name,
            newDatetime: getTimeHuman(getReminderById(id).datetime)
        })
    }

    // One reminder found, new datetime not provided
    if (reminders.length === 1 && !slots.new_reminder_datetime) {
        logger.debug('One reminder found, new datetime not provided')
        slots.depth = knownSlots.depth - 1
        flowContinueBuiltin(flow, slots, require('./index').rescheduleReminder)
        flow.continue('snips-assistant:RescheduleReminder', (msg, flow) => {
            return require('./index').rescheduleReminder(msg, flow, slots, reminders)
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
            number: reminders.length,
            odd: (reminders.length === 1) ? '' : 's'
        }) + i18n('rescheduleReminder.ask.whichToReschedule')
    }

    // // No reminders, no slots
    // if (!reminders.length && !Object.keys(slots).length) {
    //     logger.debug('No reminders, no slots')
    //     flow.end()
    //     return i18n('getReminders.info.noReminderFound')
    // }
    //
    // // No reminder found, former_reminder_datetime or new_reminder_datetime provided
    // // No reminder found, one of the slots provided
    // if (!reminders.length && Object.keys(slots).length) {
    //     logger.debug('No reminder found, one of the slots provided')
    //     flowContinueBuiltin(flow, knownSlots, require('./index').rescheduleReminder)
    //     flow.continue('snips-assistant:Yes', (msg, flow) => {
    //         slots.depth = 3
    //         return require('./index').setReminder(msg, flow, slots)
    //     })
    //     flow.continue('snips-assistant:No', (msg, flow) => {
    //         flow.end()
    //     })
    //     return i18n('rescheduleReminder.info.noReminderFound') + i18n('setReminder.ask.createReminder')
    // }

    flow.end()
    return i18n('debug.caseNotRecognized')
}