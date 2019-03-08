const { logger, arrayIntersection } = require('../utils')
const generateReport = require('../tts/generateReport')
const i18nFactory = require('../factories/i18nFactory')
const { extractSlots, flowContinueBuiltin } = require('./common')
//const generateDatetimeTTS = require('../tts/generateDatetimeTTS')
const { getTimeHuman } = require('../tts/generateTime')
const {
    deleteReminderById,
    getReminders
} = require('../reminders')

module.exports = async function (msg, flow, knownSlots = { depth: 2}, reminders = null ) {
    logger.debug('cancelReminder')
    const i18n = i18nFactory.get()
    const slots = await extractSlots(msg)

    if (!reminders) {
        return require('./index').getReminder(msg, flow, { depth: 3}, (msg, flow, knownSlots, reminders) => {
            return require('./index').cancelReminder(msg, flow, knownSlots, reminders)
        })
    }

    const report = generateReport(reminders, slots)

    // Cancel all the found reminders
    //if (reminders) {
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

    return reminders.length === 1 ? i18n('cancelReminder.ask.confirmToCancelReminder', {
        name: reminders[0].name,
        time: getTimeHuman(reminders[0].datetime, reminders[0].recurrence)
    }) : report.head + i18n('cancelReminder.ask.confirmToCancelAll')
    //}

    // Found reminders by using some of the constrains
    // if (reminders.length === 1) {
    //     flow.continue('snips-assistant:Yes', (msg, flow) => {
    //         flow.end()
    //         deleteReminderById(reminders[0].id)
    //         return i18n('cancelReminder.info.successfullyCancelled_', {
    //             name: reminders[0].name
    //         })
    //     })
    //     flow.continue('snips-assistant:No', (msg, flow) => {
    //         flow.end()
    //     })
    //     return i18n('cancelReminder.ask.confirmToCancelReminder', {
    //         name: reminders[0].name,
    //         time: getTimeHuman(reminders[0].datetime, reminders[0].recurrence)
    //     })
    // } else {
    //     flow.end()
    //     return i18n('cancelReminder.info.multiRemindersFound')
    // }

    flow.end()
    return i18n('debug.caseNotRecognized')
}