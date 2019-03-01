const { Hermes, Dialog } = require('hermes-javascript')
const { logger } = require('../utils')
const { BUILTIN_INTENTS } = require('../bindings')

module.exports = (text, customData = null, siteId='default', intentFilter = BUILTIN_INTENTS) => {
    logger.debug('------------------') 
    logger.info(`Asking: ${text}`)

    const hermes = new Hermes()
    const dialog = hermes.dialog()
    dialog.publish('start_session', {
        init: {
            type: Dialog.enums.initType.action,
            text: text,
            intentFilter: intentFilter,
            canBeEnqueued: false,
            sendIntentNotRecognized: true
        },
        customData: customData,
        siteId: siteId
    })
}