import { translation, logger, message } from '../utils'
import { FlowContinuation, IntentMessage, FlowActionReturn, Hermes } from 'hermes-javascript'

import { setReminderHandler } from './setReminder'
import { getReminderHandler } from './getReminder'
import { cancelReminderHandler } from './cancelReminder'
import { renameReminderHandler } from './renameReminder'
import { rescheduleReminderHandler } from './rescheduleReminder'
import { Database } from '../class/Database'
import { ReminderSlots } from './common';

export type Handler = (
    message: IntentMessage,
    flow: FlowContinuation,
    database: Database,
    options: HandlerOptions
) => FlowActionReturn

export type HandlerOptions = {
    confidenceScore: ConfidenceScore
    knownSlots?: ReminderSlots,
    depth: number
} 

type ConfidenceScore = {
    intentStandard: number
    intentDrop: number
    slotStandard?: number
    slotDrop: number
    asrStandard?: number
    asrDrop: number
}

// Wrap handlers to gracefully capture errors
const handlerWrapper = (handler: Handler): Handler => (
    async (msg, flow, hermes, options) => {
        //logger.debug('message: %O', msg)
        try {
            // Check confidenceScore before call the handler
            if (msg.intent.confidenceScore < options.confidenceScore.intentDrop) {
                throw new Error('nluIntentErrorBad')
            }

            if (msg.intent.confidenceScore < options.confidenceScore.intentStandard) {
                throw new Error('nluIntentErrorStanderd')
            }
        
            if (message.getAsrConfidence(msg) < options.confidenceScore.asrDrop) {
                throw new Error('asrError')
            }

            const tts = await handler(msg, flow, hermes, options)

            return tts
        } catch (error) {
            flow.end()
            logger.error(error)
            return await translation.errorMessage(error)
        }
    }
)

// Add handlers here, and wrap them.
export default {
    setReminder: handlerWrapper(setReminderHandler),
    getReminder: handlerWrapper(getReminderHandler),
    cancelReminder: handlerWrapper(cancelReminderHandler),
    renameReminder: handlerWrapper(renameReminderHandler),
    rescheduleReminder: handlerWrapper(rescheduleReminderHandler)
}