const { logger } = require('../utils')
const generateReport = require('../tts/generateReport')
const i18nFactory = require('../factories/i18nFactory')
const { extractSlots, flowContinueBuiltin } = require('./common')
const { getTimeHuman } = require('../tts/generateTime')
const {
    deleteReminderById
} = require('../reminders')

module.exports = async function (msg, flow, knownSlots = { depth: 2}, reminders = null ) {
    logger.debug(`cancelReminder, depth: ${knownSlots.depth}`)
    const i18n = i18nFactory.get()
    const slots = await extractSlots(msg)

    // Reached the max re-try times
    if (knownSlots.depth === 0) {
        logger.debug('Reached the max re-try times')
        flow.end()
        return i18n('common.error.doNotUnderstantd')
    }

    if (!(slots.reminder_name || slots.datetime || slots.recurrence)) {
        logger.debug('No constrain')
        knownSlots.depth -= 1
        flowContinueBuiltin(flow, knownSlots, require('./index').cancelReminder)
        flow.continue('snips-assistant:CancelReminder', (msg, flow) => {
            return require('./index').cancelReminder(msg, flow, knownSlots)
        })
        return i18n('cancelReminder.ask.whichToCancel')
    }

    if (!reminders) {
        return require('./index').getReminder(msg, flow, { depth: 3}, (msg, flow, knownSlots, reminders) => {
            return require('./index').cancelReminder(msg, flow, knownSlots, reminders)
        })
    }

    const report = generateReport(reminders, slots)

    logger.debug('Cancel all the found reminders')
    flow.continue('snips-assistant:Yes', (msg, flow) => {
        flow.end()
        reminders.forEach(reminder => {
            deleteReminderById(reminder.id)
        })
        return (reminders.length === 1) ? i18n('cancelReminder.info.successfullyCancelled_', {
            name: reminders[0].name
        }) : i18n('cancelReminder.info.confirmRemindersCancelled')
    })
    flow.continue('snips-assistant:No', (msg, flow) => {
        flow.end()
    })

    return (reminders.length === 1) ? i18n('cancelReminder.ask.confirmToCancelReminder', {
        name: reminders[0].name,
        time: getTimeHuman(reminders[0].datetime, reminders[0].recurrence)
    }) : (report.head + i18n('cancelReminder.ask.confirmToCancelAll'))
}