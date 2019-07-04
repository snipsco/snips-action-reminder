import handlers from './index'
import { translation } from '../utils'
import { logger, i18n, Handler, config } from 'snips-toolkit'
import { flowContinueTerminate, ReminderSlots, extractSlots } from './common'
import { Reminder } from '../class/Reminder'
import { INTENT_FILTER_PROBABILITY_THRESHOLD } from '../constants'

export const getReminderHandler: Handler = async function(msg, flow, database, knownSlots = { depth: 2 }) {
    logger.info('GetReminder')

    // Extract slots
    const slots: ReminderSlots = extractSlots(msg, knownSlots)

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
            return handlers.setReminder(msg, flow, database, (msg, flow) => {
                if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                    throw new Error('intentNotRecognized')
                }

                const options: { reminderName?: string, datetime?: Date, recurrence?: string } = {}
                if (slots.reminderName) options.reminderName = slots.reminderName
                if (slots.recurrence) options.recurrence = slots.recurrence
                if (slots.datetime) options.datetime = slots.datetime

                return handlers.setReminder(msg, flow, database, {
                    ...options,
                    depth: knownSlots.depth - 1
                })
            })
        })
        flow.continue(`${ config.get().assistantPrefix }:No`, (_, flow) => {
            flow.end()
            return
        })
        flowContinueTerminate(flow)

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
