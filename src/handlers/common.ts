import { getCompletedDatetime, DatetimeRange, getDatetimeRange } from '../utils'
import { message, camelize, config } from 'snips-toolkit'
import { SLOTS_CUSTOM, SLOTS_TIME, SLOT_CONFIDENCE_THRESHOLD } from '../constants'
import { IntentMessage, NluSlot, slotType, grain, FlowContinuation } from 'hermes-javascript/types'
import { HandlerOptions } from './index'

export type ReminderSlots = {
    reminderName?: string
    newReminderName?: string

    datetime?: Date
    datetimeRange?: DatetimeRange
    newDatetime?: Date

    recurrence?: string

    allReminders?: string
    pastReminders?: string
}

/**
 * All-in-one slots parser for Reminder App
 *
 * @param msg
 * @param options
 */
export const extractSlots = function(
    msg: IntentMessage,
    options: HandlerOptions
): ReminderSlots {
    const res: ReminderSlots = {}
    // Only extract custom type slot
    SLOTS_CUSTOM.forEach(slotName => {
        const slotNameCam = camelize.camelize(slotName)
        // Check if it exists in knownSlots
        if (options.knownSlots && slotNameCam in options.knownSlots) {
            res[slotNameCam] = options.knownSlots[slotNameCam]
            return
        }

        // Get slot object from message
        const tmp: NluSlot<slotType.custom> | null = message.getSlotsByName(msg, slotName, {
            threshold: SLOT_CONFIDENCE_THRESHOLD,
            onlyMostConfident: true
        })

        // Not found
        if (!tmp) {
            return
        }

        res[slotNameCam] = tmp.value.value
    })

    // Only extract snips/datetime type slot
    SLOTS_TIME.forEach(slotName => {
        const slotNameCam = camelize.camelize(slotName)
        // Check if it exists in knownSlots
        if (options.knownSlots && slotNameCam in options.knownSlots) {
            res[slotNameCam] = options.knownSlots[slotNameCam]
            return
        }

        // Get slot object from message
        const tmp: NluSlot<slotType.instantTime | slotType.timeInterval> | null = message.getSlotsByName(msg, slotName, {
            threshold: SLOT_CONFIDENCE_THRESHOLD,
            onlyMostConfident: true
        })

        // Not found
        if (!tmp) {
            return
        }

        if (tmp.value.kind === 'TimeInterval') {
            // Use start time as time value
            res[slotNameCam] = getCompletedDatetime({
                kind: slotType.instantTime,
                value: tmp.value.from,
                grain: grain.minute,
                precision: 'Exact'
            })
            // Generate a DatetimeRange in case the handler needs
            if (slotNameCam == 'datetime') {
                res.datetimeRange = getDatetimeRange({
                    kind: slotType.instantTime,
                    value: tmp.value.from,
                    grain: grain.minute,
                    precision: 'Exact'
                })
            }
        } else if (tmp.value.kind === 'InstantTime') {
            // Complete time
            res[slotNameCam] = getCompletedDatetime(tmp.value)

            // Generate a DatetimeRange in case the handler needs
            if (slotNameCam == 'datetime') {
                res.datetimeRange = getDatetimeRange(tmp.value)
            }
        }
    })

    return res
}

/**
 * Construct a new handler option for next recursion call
 *
 * @param options
 * @param slots
 */
export const nextOptions = (
    options: HandlerOptions,
    slots: ReminderSlots
): HandlerOptions => {
    return { ...options, knownSlots: slots, depth: options.depth - 1 }
}

export const flowContinueTerminate = (flow: FlowContinuation) => {
    flow.continue(`${ config.get().assistantPrefix }:Cancel`, (_, flow) => {
        flow.end()
    })
    flow.continue(`${ config.get().assistantPrefix }:StopSilence`, (_, flow) => {
        flow.end()
    })
}
