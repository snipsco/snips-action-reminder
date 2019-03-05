const i18nFactory = require('../factories/i18nFactory')
const { logger } = require('../utils')
const { extractSlots, flowContinueBuiltin} = require('./common')
const { createReminder } = require('../reminders')
const generateDatetimeTTS = require('../tts/generateDatetimeTTS')

// Sub-handler, create a new reminder
function newReminder (flow, slots) {
    logger.debug('createReminder')
    flow.end()
    const i18n = i18nFactory.get()
    let reminder = createReminder(slots.reminder_name,
                                  slots.datetime,
                                  slots.recurrence)
    if (reminder){
        return i18n('inform.confirmReminderSet', {
            name: reminder.name,
            date_time: generateDatetimeTTS(reminder.datetime),
            recurrence: reminder.recurrence
        })
    } else {
        return i18n('inform.canNotCreateReminder')
    }
}

// Sub-handler, asking for time (datetime or recurrence)
function newReminderMissingTime (flow, slots, depth) {
    logger.debug('createReminderMissingTime')
    slots.depth = depth - 1
    flowContinueBuiltin(flow, slots, require('./index').setReminder)
    const i18n = i18nFactory.get()

    flow.continue('snips-assistant:SetReminder', (msg, flow) => {
        return require('./index').setReminder(msg, flow, slots)
    })

    return i18n('ask.time')
}

// Sub-handler, asking for name
function newReminderMissingName (flow, slots, depth) {
    logger.debug('createReminderMissingName')
    slots.depth = depth - 1
    flowContinueBuiltin(flow, slots, require('./index').setReminder)
    const i18n = i18nFactory.get()

    flow.continue('snips-assistant:SetReminder', (msg, flow) => {
        return require('./index').setReminder(msg, flow, slots)
    })

    return i18n('ask.name')
}

// Sub-handler, asking for both name and time
function newReminderMissingNameAndTime (flow, slots, depth) {
    logger.debug('createReminderMissingNameAndTime')
    slots.depth = depth - 1
    flowContinueBuiltin(flow, slots, require('./index').setReminder)
    const i18n = i18nFactory.get()

    flow.continue('snips-assistant:SetReminder', (msg, flow) => {
        return require('./index').setReminder(msg, flow, slots)
    })
    
    return i18n('ask.nameAndTime')
}

// Create a new reminder and save it into the file system
module.exports = async function (msg, flow, knownSlots = { depth: 3 }) {
    logger.debug(`SetReminder, depth: ${knownSlots.depth}`)
    const i18n = i18nFactory.get()
    const slots = await extractSlots(msg, knownSlots)

    // name and time (datetime or recurrence) are provided
    if (slots.reminder_name && (slots.recurrence || slots.datetime)) {
        return newReminder(flow, slots)
    }

    // intent not recognized
    if (knownSlots.depth === 0) {
        flow.end()
        return i18n('inform.doNotUnderstantd')
    }

    // slot name not provided
    if (!slots.reminder_name && (slots.recurrence || slots.datetime)) {
        return newReminderMissingName(flow, slots, knownSlots.depth)
    }

    // slot datetime or recurrence is not provided
    if (slots.reminder_name && !(slots.recurrence || slots.datetime)) {
        return newReminderMissingTime(flow, slots, knownSlots.depth)
    }

    // no slot provided
    if (!slots.reminder_name && !(slots.recurrence || slots.datetime)) {
        return newReminderMissingNameAndTime(flow, slots, knownSlots.depth)
    }

    flow.end()
    return i18n('debug.caseNotRecognized')
}