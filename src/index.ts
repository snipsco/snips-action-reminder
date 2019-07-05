import fs from 'fs'
import path from 'path'
import { DB_DIR, ASSETS_DIR } from './constants'
import handlers from './handlers'
import { Database } from './utils/reminder/database'
import { config, i18n, logger } from 'snips-toolkit'
import { Hermes, Done } from 'hermes-javascript'
import { beautify } from './utils/beautify'

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
        beautify.init()
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

        // Subscribe to the app intents
        dialog.flows([
            {
                intent: `${ config.get().assistantPrefix }:SetReminder`,
                action: (msg, flow) => handlers.setReminder(msg, flow, database)
            },
            {
                intent: `${ config.get().assistantPrefix }:GetReminder`,
                action: (msg, flow) => handlers.getReminder(msg, flow, database)
            },
            {
                intent: `${ config.get().assistantPrefix }:CancelReminder`,
                action: (msg, flow) => handlers.cancelReminder(msg, flow, database)
            }
        ])
    } catch (error) {
        // Output initialization errors to stderr and exit
        const message = await i18n.errorMessage(error)
        logger.error(message)
        logger.error(error)
        // Exit
        done()
    }
}
