import handlers from './index'
import { translation } from '../utils'
import { logger, i18n, Handler, config } from 'snips-toolkit'
import { flowContinueTerminate, nextOptions, ReminderSlots, extractSlots } from './common'
import { Reminder } from '../class/Reminder'

export const getReminderHandler: Handler = async function(
    msg,
    flow,
    database,
    options
) {
    logger.debug(`${msg.intent.intentName} [${options.depth}]`)

    // Add handler for intentNotRecognized
    flow.notRecognized((_, flow) => {
        return handlers.getReminder(
            msg,
            flow,
            database,
            nextOptions(options, slots)
        )
    })

    // Extract slots
    const slots: ReminderSlots = extractSlots(msg, options)

    // Get reminders
    const reminders: Reminder[] = database.get({
        isExpired: slots.pastReminders ? true : false,
        name: slots.reminderName || undefined,
        datetimeRange: slots.datetimeRange || undefined,
        recurrence: slots.recurrence || undefined
    })

    // No reminders, no slots
    if (!reminders.length && !Object.keys(slots).length) {
        flow.end()
        return i18n.translate('getReminder.info.noReminderFound')
    }

    // No reminders, slots detected
    if (!reminders.length && Object.keys(slots).length) {
        flow.continue(`${ config.get().assistantPrefix }:Yes`, (msg, flow) => {
            return handlers.setReminder(
                msg,
                flow,
                database,
                nextOptions(options, slots)
            )
        })
        flow.continue(`${ config.get().assistantPrefix }:No`, (_, flow) => {
            flow.end()
            return
        })
        flowContinueTerminate(flow)
        flow.notRecognized((_, flow) => {
            return handlers.getReminder(
                msg,
                flow,
                database,
                nextOptions(options, slots)
            )
        })
        return (
            i18n.translate('getReminder.info.noSuchRemindersFound') +
            ' ' +
            i18n.translate('setReminder.ask.createReminder')
        )
    }

    // Found reminders by using some of the constrains, no need to continue
    if (reminders.length) {
        flow.end()
        return translation.reportGetReminder(
            reminders
            //Boolean(slots.pastReminders)
        )
    }

    flow.end()
    throw new Error('setReminderUnhandled')
}
