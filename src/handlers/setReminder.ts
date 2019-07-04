import handlers from './index'
import { translation } from '../utils'
import { logger, i18n, Handler, config } from 'snips-toolkit'
import { ReminderSlots, extractSlots, KnownSlots } from './common'
import { ReminderInit, Reminder } from '../class/Reminder'
import { INTENT_FILTER_PROBABILITY_THRESHOLD } from '../constants'

export const setReminderHandler: Handler = async function (msg, flow, database, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('SetReminder')

    // Extract slots
    const slots: ReminderSlots = extractSlots(msg, knownSlots)

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

        return translation.reportSetReminder(reminder)
    }

    // Intent not recognized
    if (knownSlots.depth === 0) {
        flow.end()
        throw new Error('intentNotRecognized')
    }

    const elicitationCallback = (msg, flow) => {
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
    }

    // Required slot: name
    if (!slots.reminderName && (slots.recurrence || slots.datetime)) {
        flow.continue(`${ config.get().assistantPrefix }:ElicitReminderName`, elicitationCallback)
        return i18n.translate('setReminder.ask.name')
    }

    // Required slot: datetime or recurrence
    if (slots.reminderName && !(slots.recurrence || slots.datetime)) {
        flow.continue(`${ config.get().assistantPrefix }:ElicitReminderTime`, elicitationCallback)
        return i18n.translate('setReminder.ask.time')
    }

    // Require slot: name, datetime/recurrence
    if (!slots.reminderName && !(slots.recurrence || slots.datetime)) {
        flow.continue(`${ config.get().assistantPrefix }:ElicitReminderTime`, elicitationCallback)
        flow.continue(`${ config.get().assistantPrefix }:ElicitReminderName`, elicitationCallback)
        return i18n.translate('setReminder.ask.nameAndTime')
    }

    flow.end()
    throw new Error('setReminderUnhandled')
}
