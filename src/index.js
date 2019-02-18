const { withHermes } = require('hermes-javascript')
const bootstrap = require('./bootstrap')
const handlers = require('./handlers')
const { translation, logger } = require('./utils')

// Initialize hermes
module.exports = function ({
    hermesOptions = {},
    bootstrapOptions = {}
} = {}) {
    withHermes(async (hermes, done) => {
        try {
            // Bootstrap config, locale, i18n…
            await bootstrap(bootstrapOptions)

            const dialog = hermes.dialog()

            dialog.flows([
                {
                    intent: 'snips-assistant:SetReminder',
                    action: handlers.setReminder
                },
                {
                    intent: 'snips-assistant:GetReminders',
                    action: handlers.getReminder
                },
                {
                    intent: 'snips-assistant:RescheduleReminder',
                    action: handlers.rescheduleReminder
                },
                {
                    intent: 'snips-assistant:RenameReminder',
                    action: handlers.renameReminder
                }
            ])

            // dialog.publish('start_session', {
            //     site_id: 'default',
            //     session_init: {
            //         init_type:  Dialog.enums.initType.notification,
            //         value: 'Reminder action code is ready'
            //     }
            // })

        } catch (error) {
            // Output initialization errors to stderr and exit
            const message = await translation.errorMessage(error)
            logger.error(message)
            logger.error(error)
            // Exit
            done()
        }
    }, hermesOptions)
}