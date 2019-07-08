import handlers from './index'
import { logger, i18n, Handler, config, message } from 'snips-toolkit'
import commonHandler, { KnownSlots } from './common'
import { Reminder } from '../utils/reminder/reminder'
import { SLOT_CONFIDENCE_THRESHOLD } from '../constants'
import { translation, Database, getExactDate } from '../utils'
import { NluSlot, slotType } from 'hermes-javascript/types'

export const setReminderHandler: Handler = async function (msg, flow, database: Database, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('SetReminder')

    if (knownSlots.depth === 0) {
        throw new Error('intentNotRecognized')
    }

    const {
        name,
        recurrence
    } = await commonHandler(msg, knownSlots)

    let date: Date | undefined

    const dateSlot: NluSlot<slotType.instantTime | slotType.timeInterval> | null = message.getSlotsByName(msg, 'datetime', {
        onlyMostConfident: true,
        threshold: SLOT_CONFIDENCE_THRESHOLD
    })

    if (!('date' in knownSlots)) {
        if (dateSlot) {
            if (dateSlot.value.kind === slotType.timeInterval) {
                date = getExactDate({ date: dateSlot.value.from })
            } else if (dateSlot.value.kind === slotType.instantTime) {
                date = getExactDate({ date: dateSlot.value.value, grain: dateSlot.value.kind })
            }
        }
    } else {
        date = knownSlots.date
    }

    const elicitationCallback = (msg, flow) => {
        /*
        if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
            throw new Error('intentNotRecognized')
        }
        */

        const options: { name?: string, date?: Date, recurrence?: string } = {}
        if (name) options.name = name
        if (recurrence) options.recurrence = recurrence
        if (date) options.date = date

        return handlers.setReminder(msg, flow, database, {
            ...options,
            depth: knownSlots.depth - 1
        })
    }

    // Required slots: name and datetime
    if (!name && !date) {
        flow.continue(`${ config.get().assistantPrefix }:ElicitReminderTime`, elicitationCallback)
        flow.continue(`${ config.get().assistantPrefix }:ElicitReminderName`, elicitationCallback)

        return i18n.translate('setReminder.ask.nameAndTime')
    }

    // Required slot: name
    if (!name) {
        flow.continue(`${ config.get().assistantPrefix }:ElicitReminderName`, elicitationCallback)

        return i18n.translate('setReminder.ask.name')
    }

    // Required slot: datetime or recurrence
    if (!date) {
        flow.continue(`${ config.get().assistantPrefix }:ElicitReminderTime`, (msg, flow) => {
            /*
            if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                throw new Error('intentNotRecognized')
            }
            */

            const options: { name?: string, date?: Date, recurrence?: string } = {}
            if (name) options.name = name
            if (recurrence) options.recurrence = recurrence
            if (date) options.date = date

            return handlers.setReminder(msg, flow, database, {
                ...options,
                depth: knownSlots.depth - 1
            })
        })

        return i18n.translate('setReminder.ask.time')
    }

    logger.info('\tdate: ', date)

    const reminder: Reminder = database.add(
        date,
        recurrence,
        name
    )

    flow.end()
    return translation.setReminderToSpeech(reminder)
}
