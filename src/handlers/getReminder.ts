import handlers, { Handler } from './index'
import { logger, translation } from '../utils'
import { flowContinueTerminate, nextOptions, ReminderSlots, extractSltos } from './common';
import { Reminder } from '../class/Reminder';

export const getReminderHandler: Handler = async function (msg, flow, database, options) {
    logger.debug(`${msg.intent.intentName}, depth: ${options.depth}`)

    flowContinueTerminate(flow)

    // Add handler for intentNotRecognized
    flow.notRecognized((_, flow) => {
        return handlers.setReminder(msg, flow, database, nextOptions(options, slots))
    })

    // Extract slots
    const slots: ReminderSlots = extractSltos(msg, options)
    
    // Get reminders
    const reminders: Reminder[] = database.get({
        isExpired: slots.pastReminders ? true : false,
        name: slots.reminderName || undefined,
        datetimeRange: slots.datetimeRange || undefined,
        recurrence: slots.recurrence || undefined
    })
    logger.debug('found: ', reminders)
    // No reminders, no slots
    if (!reminders.length && !Object.keys(slots).length) {
        flow.end()
        return translation.getRandom('getReminder.info.noReminderFound')
    }

    // No reminders, slots detected
    if (!reminders.length && Object.keys(slots).length) {
        flow.continue('snips-assistant:Yes', (msg, flow) => {
            return handlers.setReminder(msg, flow, database, nextOptions(options, slots))
        })
        return translation.getRandom('getReminders.info.noSuchRemindersFound') + 
               translation.getRandom('setReminder.ask.createReminder')
    }

    // Found reminders by using some of the constrains, no need to continue
    if (reminders.length) {
        flow.end()
        return translation.reportGetReminder(reminders, Boolean(slots.pastReminders))
    }

    flow.end()
    throw new Error('setReminderUnhandled')
}