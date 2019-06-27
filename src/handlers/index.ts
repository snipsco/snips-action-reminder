import { handler, ConfidenceThresholds } from 'snips-toolkit'
import { setReminderHandler } from './setReminder'
import { getReminderHandler } from './getReminder'
import { cancelReminderHandler } from './cancelReminder'
import { renameReminderHandler } from './renameReminder'
import { INTENT_PROBABILITY_THRESHOLD, ASR_UTTERANCE_CONFIDENCE_THRESHOLD } from '../constants'
import { ReminderSlots } from './common'

export type HandlerOptions = {
    confidenceScore: ConfidenceScore
    knownSlots?: ReminderSlots
    depth: number
    isReturnObj: boolean
}

type ConfidenceScore = {
    intentStandard: number
    intentDrop: number
    slotStandard?: number
    slotDrop: number
    asrStandard?: number
    asrDrop: number
}

const thresholds: ConfidenceThresholds = {
    intent: INTENT_PROBABILITY_THRESHOLD,
    asr: ASR_UTTERANCE_CONFIDENCE_THRESHOLD
}

// Add handlers here, and wrap them.
export default {
    setReminder: handler.wrap(setReminderHandler, thresholds),
    getReminder: handler.wrap(getReminderHandler, thresholds),
    cancelReminder: handler.wrap(cancelReminderHandler, thresholds),
    renameReminder: handler.wrap(renameReminderHandler, thresholds)
}
