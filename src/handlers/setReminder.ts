import { Handler } from './index'
import { logger, translation, beautify } from '../utils'
import { ReminderSlots, extractSltos } from './common'
import { ReminderInit, Reminder } from '../class/Reminder'


export const setReminderHandler: Handler = async function (msg, flow, database, options) {
    logger.debug(`SetReminder, depth: ${options.knownSlots.depth}`)

    const slots: ReminderSlots = extractSltos(msg, options)

    // Create a new reminder
    if (slots.reminderName && (slots.recurrence || slots.datetime)) {
        logger.debug('createReminder', slots)
        flow.end()
        
        const reminderInitObj: ReminderInit = {
            name: slots.reminderName,
            datetime: slots.datetime || undefined,
            recurrence: slots.recurrence || undefined 
        }
        
        const reminder: Reminder = database.add(reminderInitObj)
        
        return translation.random('setReminder.info.reminder_SetFor_', {
            name: reminder.name,
            time: beautify.date(reminder.nextExecution)
        })
    }

    // intent not recognized
    if (options.knownSlots.depth === 0) {
        throw new Error('nluIntentErrorStanderd')
    }

    // slot name not provided
    if (!slots.reminderName && (slots.recurrence || slots.datetime)) {
        // reserved 
        return
    }

    // slot datetime or recurrence is not provided
    if (slots.reminderName && !(slots.recurrence || slots.datetime)) {
        // reserved 
        return
    }

    // no slot provided
    if (!slots.reminderName && !(slots.recurrence || slots.datetime)) {
        flow.continue('snips-assistant:SetReminder', (msg, flow) => {
            options.knownSlots.depth -= 1
            return require('./index').setReminder(msg, flow, database, options)
        })
        // reserved 
        return
    }

    throw new Error('setReminderUnhandled')
}