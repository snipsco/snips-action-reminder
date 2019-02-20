const { Hermes, Dialog } = require('hermes-javascript')
const { logger } = require('../utils')
const { BUILTIN_INTENTS } = require('../bindings')

module.exports = (text, customData = null, siteId='default', intentFilter = BUILTIN_INTENTS) => {
    logger.info(`Asking: ${text}`)

    const hermes = new Hermes()
    const dialog = hermes.dialog()
    dialog.publish('start_session', {
        custom_data: customData,
        site_id: siteId,
        session_init: {
            init_type:  Dialog.enums.initType.action,
            value: {
                text: text,
                intent_filter: intentFilter,
                can_be_enqueued: true,
                send_intent_not_recognized: true
            }
        }
    })
}