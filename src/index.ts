import fs from 'fs'
import path from 'path'
import { withHermes } from 'hermes-javascript'
import bootstrap from './bootstrap'
import { configFactory } from './factories'
import { translation, logger, camelize } from './utils'
import {
    CONFIDENCE_DEFAULT,
    INTENT_PREFIX_DEFAULT,
    INTENTS_MAIN
} from './constants'
import handlers, { HandlerOptions } from './handlers'
import { Database } from './class/Database'

const alarmWav = fs.readFileSync(
    path.resolve(__dirname, '../assets/dingding.wav')
)

export default function({
    hermesOptions = {},
    bootstrapOptions = {}
} = {}): Promise<() => void> {
    return new Promise((resolve, reject) => {
        withHermes(async (hermes, done) => {
            try {
                await bootstrap(bootstrapOptions)

                // Publish the alarm sound.
                hermes.tts().publish('register_sound', {
                    soundId: 'ding.ding',
                    wavSound: alarmWav.toString('base64'),
                    wavSoundLen: alarmWav.length
                })

                const config = configFactory.get()
                const database = new Database(hermes)

                // Construct handler options
                const handlerOptions: HandlerOptions = {
                    confidenceScore: {
                        intentStandard:
                            Number(config.confidenceIntentStanderd) ||
                            CONFIDENCE_DEFAULT.INTENT_STANDARD,
                        intentDrop:
                            Number(config.confidenceIntentDrop) ||
                            CONFIDENCE_DEFAULT.INTENT_DROP,
                        slotDrop:
                            Number(config.confidenceSlotDrop) ||
                            CONFIDENCE_DEFAULT.SLOT_DROP,
                        asrDrop:
                            Number(config.confidenceAsrDrop) ||
                            CONFIDENCE_DEFAULT.ASR
                    },
                    intentPrefix: config.intentPrefix || INTENT_PREFIX_DEFAULT,
                    depth: 3,
                    isReturnObj: false
                }

                const dialog = hermes.dialog()
                // Subscribe to non-elicitation intent
                INTENTS_MAIN.forEach(intent => {
                    dialog.flow(
                        `${config.intentPrefix ||
                            INTENT_PREFIX_DEFAULT}${intent}`,
                        (msg, flow) =>
                            handlers[camelize.camelize(intent)](
                                msg,
                                flow,
                                database,
                                handlerOptions
                            )
                    )
                })

                resolve(done)
            } catch (error) {
                // Output initialization errors to stderr and exit
                const message = await translation.getError(error)
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
