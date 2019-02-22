const i18nFactory = require('../factories/i18nFactory')
const { logger } = require('../utils')
const commonHandler = require('./common')

function createReminder (flow, parsedSlots, knownSlots) {
    logger.debug('createReminder')
    const i18n = i18nFactory.get()
    let reminder = G_allReminders.addNew(parsedSlots.reminder_name, parsedSlots.datetime, parsedSlots.recurrence)
    if (reminder){
        flow.end()
        var options = {month: "long", day: "numeric", hour: "numeric", minute: "numeric"}
        return i18n('info.confirmReminderSet', {
            name: reminder.name,
            date_time: reminder.datetime.toLocaleString('fr-FR', options),
            recurrence: reminder.recurrence
        })
    } else {
        return i18n('info.canNotCreateReminder')
    }
}

// time = datetime or recurrence
function createReminderMissingTime (flow, parsedSlots, knownSlots) {
    logger.debug('createReminderMissingTime')
    const i18n = i18nFactory.get()
    //flow.end()
    flow.continue('snips-assistant:SetReminder', (msg, flow) => {
        logger.info('flow continue for SetReminder')

        slotDetected = {
            reminder_name: parsedSlots.reminder_name,
            depth:
        }
        flow.end()
    })
    return i18n('ask.time')
}

function createReminderMissingName (flow, parsedSlots, knownSlots) {
    logger.debug('createReminderMissingName')
    const i18n = i18nFactory.get()
    flow.end()
    return i18n('ask.name')
}

function createReminderMissingNameAndTime (flow, parsedSlots, knownSlots) {
    logger.debug('createReminderMissingNameAndTime')
    const i18n = i18nFactory.get()
    flow.end()
    return i18n('ask.nameAndTime')
}

// Create a new reminder and save it into the file system
module.exports = async function (msg, flow, knownSlots = { depth: 2 }) {
    logger.debug('SetReminder')
    const slots = await commonHandler(msg, knownSlots)
    if (slots.reminder_name && (slots.recurrence || slots.datetime)) {
        return createReminder(flow, slots, knownSlots)
    } else if ( !slots.reminder_name && (slots.recurrence || slots.datetime) ) {
        return createReminderMissingName(flow, slots, knownSlots)
    } else if ( slots.reminder_name && !(slots.recurrence || slots.datetime) ) {
        return createReminderMissingTime(flow, slots, knownSlots)
    } else if ( !slots.reminder_name && !(slots.recurrence || slots.datetime)) {
        return createReminderMissingNameAndTime(flow, slots, knownSlots)
    } else {
        return 'case not addressed! Please check as soon as possible'
    }
}