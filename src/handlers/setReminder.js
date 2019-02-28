const i18nFactory = require('../factories/i18nFactory')
const { logger } = require('../utils')
const { extractSlots, flowContinueBuiltin} = require('./common')
const { createReminder } = require('../reminders')
const generateDatetimeTTS = require('../tts/generateDatetimeTTS')

function newReminder (flow, parsedSlots) {
    logger.debug('createReminder')
    flow.end()
    const i18n = i18nFactory.get()
    let reminder = createReminder(parsedSlots.reminder_name,
                                  parsedSlots.datetime,
                                  parsedSlots.recurrence)
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

// time = datetime or recurrence
function newReminderMissingTime (flow, parsedSlots, knownSlots) {
    logger.debug('createReminderMissingTime')
    flowContinueBuiltin(flow, knownSlots)
    const i18n = i18nFactory.get()

    flow.continue('snips-assistant:SetReminder', (msg, flow) => {
        let slotDetected = {
            reminder_name: parsedSlots.reminder_name,
            depth: knownSlots.depth - 1
        }
        return require('./index').setReminder(msg, flow, slotDetected)
    })

    return i18n('ask.time')
}

function newReminderMissingName (flow, parsedSlots, knownSlots) {
    logger.debug('createReminderMissingName')
    flowContinueBuiltin(flow, knownSlots)
    const i18n = i18nFactory.get()

    flow.continue('snips-assistant:SetReminder', (msg, flow) => {

        let slotDetected = {
            depth: knownSlots.depth - 1
        }

        if (parsedSlots.datetime) {
            slotDetected.datetime = parsedSlots.datetime
        }
        if (parsedSlots.recurrence) {
            slotDetected.recurrence = parsedSlots.recurrence
        }

        return require('./index').setReminder(msg, flow, slotDetected)
    })

    return i18n('ask.name')
}

function newReminderMissingNameAndTime (flow, parsedSlots, knownSlots) {
    logger.debug('createReminderMissingNameAndTime')
    const i18n = i18nFactory.get()
    flowContinueBuiltin(flow, knownSlots)

    flow.continue('snips-assistant:SetReminder', (msg, flow) => {
        let slotDetected = {
            depth: knownSlots.depth - 1
        }
        return require('./index').setReminder(msg, flow, slotDetected)
    })
    return i18n('ask.nameAndTime')
}

// Create a new reminder and save it into the file system
module.exports = async function (msg, flow, knownSlots = { depth: 3 }) {
    logger.debug('SetReminder')
    const i18n = i18nFactory.get()

    const slots = await extractSlots(msg, knownSlots)

    if (slots.reminder_name && (slots.recurrence || slots.datetime)) {
        return newReminder(flow, slots)
    } else if (knownSlots.depth === 0) {
        flow.end()
        return i18n('inform.doNotUnderstantd')
    } else if ( !slots.reminder_name && (slots.recurrence || slots.datetime) ) {
        return newReminderMissingName(flow, slots, knownSlots)
    } else if ( slots.reminder_name && !(slots.recurrence || slots.datetime) ) {
        return newReminderMissingTime(flow, slots, knownSlots)
    } else if ( !slots.reminder_name && !(slots.recurrence || slots.datetime)) {
        return newReminderMissingNameAndTime(flow, slots, knownSlots)
    } else {
        flow.end()
        return i18n('debug.caseNotRecognized')
    }
}