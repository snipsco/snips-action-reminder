import fs from 'fs'
import path from 'path'
import { camelize } from './utils'
import {
    CONFIDENCE_DEFAULT,
    INTENT_PREFIX_DEFAULT,
    INTENTS_MAIN
} from './constants'
import handlers, { HandlerOptions } from './handlers'
import { Database } from './class/Database'
import { config, i18n, logger } from 'snips-toolkit'
import { Hermes, Done } from 'hermes-javascript'

const alarmWav = fs.readFileSync(
    path.resolve(__dirname, '../assets/dingding.wav')
)

// Enables deep printing of objects.
process.env.DEBUG_DEPTH = undefined

export default async function ({
    hermes,
    done
}: {
    hermes: Hermes,
    done: Done 
}) {
    try {
        const { name } = require('../package.json')
        logger.init(name)
        // Replace 'error' with '*' to log everything
        logger.enable('error')

        config.init()
        await i18n.init(config.get().locale)

        // Publish the alarm sound.
        hermes.tts().publish('register_sound', {
            soundId: 'ding.ding',
            wavSound: alarmWav.toString('base64'),
            wavSoundLen: alarmWav.length
        })

        const dialog = hermes.dialog()
        const database = new Database(hermes)

        // Construct handler options
        const handlerOptions: HandlerOptions = {
            confidenceScore: {
                intentStandard:
                    Number(config.get().confidenceIntentStanderd) ||
                    CONFIDENCE_DEFAULT.INTENT_STANDARD,
                intentDrop:
                    Number(config.get().confidenceIntentDrop) ||
                    CONFIDENCE_DEFAULT.INTENT_DROP,
                slotDrop:
                    Number(config.get().confidenceSlotDrop) ||
                    CONFIDENCE_DEFAULT.SLOT_DROP,
                asrDrop:
                    Number(config.get().confidenceAsrDrop) ||
                    CONFIDENCE_DEFAULT.ASR
            },
            intentPrefix: config.get().intentPrefix || INTENT_PREFIX_DEFAULT,
            depth: 3,
            isReturnObj: false
        }

        // Subscribe to the app intents
        INTENTS_MAIN.forEach(intent => {
            dialog.flow(
                `${config.get().intentPrefix ||
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
    } catch (error) {
        // Output initialization errors to stderr and exit
        const message = await i18n.errorMessage(error)
        logger.error(message)
        logger.error(error)
        // Exit
        done()
    }
}
