import handlers, { Handler } from './index'
import { logger, translation, beautify } from '../utils'
import { ReminderSlots, extractSltos } from './common'
import { ReminderInit, Reminder } from '../class/Reminder'


export const setReminderHandler: Handler = async function (msg, flow, database, options) {
    logger.debug(`SetReminder, depth: ${options.knownSlots.depth}`)

    // Add handler for intentNotRecognized
    flow.notRecognized((_, flow) => {
        if (options.knownSlots.depth) {
            options.knownSlots.depth -= 1
        }
        return handlers.setReminder(msg, flow, database, options)
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
    if (options.knownSlots.depth === 0) {
        throw new Error('nluIntentErrorStanderd')
    }

    // Require slot: name
    if (!slots.reminderName && (slots.recurrence || slots.datetime)) {
        // reserved 
        return
    }

    // Require slot: datetime or recurrence
    if (slots.reminderName && !(slots.recurrence || slots.datetime)) {
        // reserved 
        return
    }

    // Require slot: name, datetime/recurrence
    if (!slots.reminderName && !(slots.recurrence || slots.datetime)) {
        flow.continue('snips-assistant:SetReminder', (msg, flow) => {
            if (options.knownSlots.depth) {
                options.knownSlots.depth -= 1
            }
            return handlers.setReminder(msg, flow, database, options)
        })
        return translation.random('setReminder.info.nameAndTime')
    }

    throw new Error('setReminderUnhandled')
}