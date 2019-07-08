import { IntentMessage, slotType, NluSlot, FlowContinuation } from 'hermes-javascript/types'
import { message, logger, config } from 'snips-toolkit'
import { SLOT_CONFIDENCE_THRESHOLD } from '../constants'
import { DateRange } from '../utils'

export type KnownSlots = {
    depth: number
    name?: string
    date?: Date
    dateRange?: DateRange
    recurrence?: string
}

export default async function (msg: IntentMessage, knownSlots: KnownSlots) {
    let name: string | undefined, recurrence: string | undefined

    if (!('name' in knownSlots)) {
        const nameSlot: NluSlot<slotType.custom> | null = message.getSlotsByName(msg, 'reminder_name', {
            onlyMostConfident: true,
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (nameSlot) {
            name = nameSlot.value.value
        }
    } else {
        name = knownSlots.name
    }

    if (!('recurrence' in knownSlots)) {
        const recurrenceSlot: NluSlot<slotType.custom> | null = message.getSlotsByName(msg, 'recurrence', {
            onlyMostConfident: true,
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (recurrenceSlot) {
            recurrence = recurrenceSlot.value.value
        }
    } else {
        recurrence = knownSlots.recurrence
    }

    logger.info('\tname: ', name)
    logger.info('\trecurrence: ', recurrence)

    return { name, recurrence }
}

export const flowContinueTerminate = (flow: FlowContinuation) => {
    flow.continue(`${ config.get().assistantPrefix }:Cancel`, (_, flow) => {
        flow.end()
    })
    flow.continue(`${ config.get().assistantPrefix }:StopSilence`, (_, flow) => {
        flow.end()
    })
}
