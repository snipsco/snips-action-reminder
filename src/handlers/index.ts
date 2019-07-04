import { handler, ConfidenceThresholds } from 'snips-toolkit'
import { setReminderHandler } from './setReminder'
import { getReminderHandler } from './getReminder'
import { cancelReminderHandler } from './cancelReminder'
import { renameReminderHandler } from './renameReminder'
import { INTENT_PROBABILITY_THRESHOLD, ASR_UTTERANCE_CONFIDENCE_THRESHOLD } from '../constants'

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
