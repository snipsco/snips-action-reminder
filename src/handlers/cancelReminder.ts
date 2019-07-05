import commonHandler, { flowContinueTerminate, KnownSlots } from './common'
import { Reminder } from '../utils/reminder/reminder'
import { i18n, logger, Handler, config, message } from 'snips-toolkit'
import { SLOT_CONFIDENCE_THRESHOLD } from '../constants'
import { DateRange, getDateRange } from '../utils'
import { NluSlot, slotType } from 'hermes-javascript/types'

export const cancelReminderHandler: Handler = async function(msg, flow, database, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('CancelReminder')

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

    // Cancel all the reminder, need to be confirmed
    if (reminders.length && (!name && !recurrence && !dateRange)) {
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

    // Found reminders by using some of the constrains, no need to continue just cancel
    if (reminders.length && (name || recurrence || dateRange)) {
        reminders.forEach(reminder => {
            database.deleteById(reminder.id)
        })

        flow.end()
        return i18n.translate('cancelReminder.info.confirm')
    }

    flow.end()
    return i18n.translate('getReminder.info.noReminderFound')
}
