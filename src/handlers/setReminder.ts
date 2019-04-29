import handlers, { Handler } from './index'
import { logger, translation, beautify } from '../utils'
import { ReminderSlots, extractSltos, nextOptions } from './common'
import { ReminderInit, Reminder } from '../class/Reminder'
import { INTENT_ELICITATION } from '../constants'
import { IntentMessage, FlowContinuation } from 'hermes-javascript';

export const setReminderHandler: Handler = async function (msg, flow, database, options) {
    logger.debug(`SetReminder, depth: ${options.depth}`)

    // Add handler for intentNotRecognized
    flow.notRecognized((_, flow) => {
        return handlers.setReminder(msg, flow, database, nextOptions(options, slots))
    })

    // Extract slots
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
            time: beautify.datetime(reminder.nextExecution)
        })
    }

    // Intent not recognized
    if (options.depth === 0) {
        throw new Error('nluIntentErrorStanderd')
    }

    const elicitationCallback = (msg: IntentMessage, flow: FlowContinuation) => {
        return handlers.setReminder(msg, flow, database, nextOptions(options, slots))
    }
    
    // Require slot: name
    if (!slots.reminderName && (slots.recurrence || slots.datetime)) {
        flow.continue(INTENT_ELICITATION.name, elicitationCallback)
        return translation.random('setReminder.ask.name')
    }

    // Require slot: datetime or recurrence
    if (slots.reminderName && !(slots.recurrence || slots.datetime)) {
        flow.continue(INTENT_ELICITATION.time, elicitationCallback)
        return translation.random('setReminder.ask.time')
    }

    // Require slot: name, datetime/recurrence
    if (!slots.reminderName && !(slots.recurrence || slots.datetime)) {
        flow.continue('snips-assistant:SetReminder', elicitationCallback)
        return translation.random('setReminder.ask.nameAndTime')
    }

    throw new Error('setReminderUnhandled')
}