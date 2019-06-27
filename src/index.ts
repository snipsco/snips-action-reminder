import fs from 'fs'
import path from 'path'
import {
    DB_DIR,
    ASSETS_DIR,
    INTENT_PROBABILITY_THRESHOLD,
    SLOT_CONFIDENCE_THRESHOLD,
    ASR_UTTERANCE_CONFIDENCE_THRESHOLD,
    INTENTS_MAIN
} from './constants'
import handlers, { HandlerOptions } from './handlers'
import { Database } from './class/Database'
import { config, i18n, logger, camelize } from 'snips-toolkit'
import { Hermes, Done } from 'hermes-javascript'

const alarmWav = fs.readFileSync(
    path.resolve(ASSETS_DIR, 'dingding.wav')
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

        if (!fs.existsSync(DB_DIR)){
            fs.mkdirSync(DB_DIR)
        }

        const database = new Database(hermes)

        // Construct handler options
        const handlerOptions: HandlerOptions = {
            confidenceScore: {
                intentStandard:
                    Number(config.get().confidenceIntentStanderd) ||
                    INTENT_PROBABILITY_THRESHOLD,
                intentDrop:
                    Number(config.get().confidenceIntentDrop) ||
                    0.01,
                slotDrop:
                    Number(config.get().confidenceSlotDrop) ||
                    SLOT_CONFIDENCE_THRESHOLD,
                asrDrop:
                    Number(config.get().confidenceAsrDrop) ||
                    ASR_UTTERANCE_CONFIDENCE_THRESHOLD
            },
            depth: 3,
            isReturnObj: false
        }

        // Subscribe to the app intents
        INTENTS_MAIN.forEach(intent => {
            dialog.flow(`${ config.get().assistantPrefix }:${ intent }`,
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
