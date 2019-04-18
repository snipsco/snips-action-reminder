import { withHermes } from 'hermes-javascript'
import bootstrap from './bootstrap'
import { configFactory } from './factories'
import { translation, logger, camelize } from './utils'
import { CONFIDENCE_DEFAULT, INTENT_PREFIX_DEFAULT, INTENTS_MAIN } from './constants'
import handlers, { HandlerOptions } from './handlers'

export default function ({
    hermesOptions = {},
    bootstrapOptions = {}
} = {}) : Promise<() => void>{
    return new Promise((resolve, reject) => {
        withHermes(async (hermes, done) => {
            try {
                await bootstrap(bootstrapOptions)
                
                const config = configFactory.get()
                // Construct handler options
                const handlerOptions: HandlerOptions = {
                    confidenceScore: {
                        intentStandard: Number(config.confidenceIntentStanderd) || CONFIDENCE_DEFAULT.INTENT_STANDARD,
                        intentDrop: Number(config.confidenceIntentDrop) || CONFIDENCE_DEFAULT.INTENT_DROP,
                        slotDrop: Number(config.confidenceSlotDrop) || CONFIDENCE_DEFAULT.SLOT_DROP,
                        asrDrop: Number(config.confidenceAsrDrop) || CONFIDENCE_DEFAULT.ASR
                    }
                }

                const dialog = hermes.dialog()
                // Subscribe to non-elicitation intent
                INTENTS_MAIN.forEach( (intent) => {
                    dialog.flow(
                        `${config.intentPrefix || INTENT_PREFIX_DEFAULT}${intent}`, 
                        (msg, flow) => handlers[camelize.camelize(intent)](msg, flow, hermes, handlerOptions)
                    )
                })
    
                resolve(done)
            } catch (error) {
                // Output initialization errors to stderr and exit
                const message = await translation.errorMessage(error)
                logger.error(message)
                logger.error(error)
                // Exit
                done()
                // Reject
                reject(error)
            }
        }, hermesOptions)
    })
}