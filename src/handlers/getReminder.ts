import handlers from './index'
import { translation, Database, getDateRange, DateRange } from '../utils'
import { logger, i18n, Handler, config, message } from 'snips-toolkit'
import commonHandler, { flowContinueTerminate } from './common'
import { Reminder } from '../utils/reminder/reminder'
import { INTENT_FILTER_PROBABILITY_THRESHOLD, SLOT_CONFIDENCE_THRESHOLD } from '../constants'
import { NluSlot, slotType } from 'hermes-javascript/types'

export const getReminderHandler: Handler = async function(msg, flow, database: Database, knownSlots = { depth: 2 }) {
    logger.info('GetReminder')

    const {
        name,
        recurrence
    } = await commonHandler(msg, knownSlots)

    let dateRange: DateRange | undefined

    const dateSlot: NluSlot<slotType.instantTime | slotType.timeInterval> | null = message.getSlotsByName(msg, 'datetime', {
        onlyMostConfident: true,
        threshold: SLOT_CONFIDENCE_THRESHOLD
    })

    if (dateSlot) {
        if (dateSlot.value.kind === slotType.timeInterval) {
            dateRange = { min: new Date(dateSlot.value.from), max: new Date(dateSlot.value.to) }
        } else if (dateSlot.value.kind === slotType.instantTime) {
            dateRange = getDateRange(new Date(dateSlot.value.value), dateSlot.value.grain)
        }
    }

    const reminders: Reminder[] = database.get(name, dateRange, recurrence)

    // No reminders, no slots
    if (!reminders.length && (!name && !recurrence && !dateRange)) {
        flow.end()
        return i18n.translate('getReminder.info.noReminderFound')
    }

    // No reminders, slots detected
    if (!reminders.length && (name || recurrence || dateRange)) {
        flow.continue(`${ config.get().assistantPrefix }:Yes`, (msg, flow) => {
            return handlers.setReminder(msg, flow, database, (msg, flow) => {
                if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                    throw new Error('intentNotRecognized')
                }

                const options: { name?: string, dateRange?: DateRange, recurrence?: string } = {}
                if (name) options.name = name
                if (recurrence) options.recurrence = recurrence
                if (dateRange) options.dateRange = dateRange

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

    flow.end()
    return translation.getRemindersToSpeech(reminders, name, dateRange, recurrence)
}
