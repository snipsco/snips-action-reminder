import handlers from './index'
import { flowContinueTerminate, KnownSlots, ReminderSlots, extractSlots } from './common'
import { Reminder } from '../class/Reminder'
import { i18n, logger, Handler, config } from 'snips-toolkit'
import { INTENT_FILTER_PROBABILITY_THRESHOLD } from '../constants'

export const cancelReminderHandler: Handler = async function(msg, flow, database, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('CancelReminder')

    // Extract slots
    const slots: ReminderSlots = extractSlots(msg, knownSlots)

    // Get reminders
    const reminders: Reminder[] = database.get({
        name: slots.reminderName || undefined,
        datetimeRange: slots.datetimeRange || undefined,
        recurrence: slots.recurrence || undefined
    })

    logger.debug(reminders)

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

    // Found reminders by using some of the constrains, no need to continue just cancel
    if (reminders.length && Object.keys(slots).length > 0) {
        reminders.forEach(reminder => {
            database.deleteById(reminder.id)
        })

        flow.end()
        return i18n.translate('cancelReminder.info.confirm')
    }

    // Cancel all the reminder, need to be confirmed
    if (reminders.length && Object.keys(slots).length === 0) {
        flow.continue(`${ config.get().assistantPrefix }:Yes`, (_, flow) => {
            reminders.forEach(reminder => {
                database.deleteById(reminder.id)
            })
            flow.end()
            return i18n.translate('cancelReminder.info.confirm')
        })
        flow.continue(`${ config.get().assistantPrefix }:No`, (_, flow) => {
            flow.end()
        })
        flowContinueTerminate(flow)

        const length = reminders.length
        return i18n.translate('cancelReminder.ask.confirm', {
            number: length,
            odd: length > 1 ? 's' : ''
        })
    }

    flow.end()
    throw new Error('setReminderUnhandled')
}
