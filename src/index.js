const { withHermes } = require('hermes-javascript')
const bootstrap = require('./bootstrap')
const handlers = require('./handlers')
const { translation, logger, say, ask } = require('./utils')
const { BINDINGS } = require('./bindings')

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
            dialog.flows(BINDINGS)

            say('Reminder action code is ready')
            ask('Do you want to continue?', '99689')

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