const { Hermes, Dialog } = require('hermes-javascript')
const logger = require('./logger')

module.exports = (text, texture = null, site_id='default', intents = ['snips-assistant:No', 'snips-assistant:Stop', 'snips-assistant:Cancel', 'snips-assistant:Silence']) => {
    logger.info(text)

    const hermes = new Hermes()
    const dialog = hermes.dialog()
    dialog.publish('start_session', {
        custom_data: texture,
        site_id: site_id,
        session_init: {
            init_type:  Dialog.enums.initType.action,
            value: {
                text: text,
                intent_filter: intents,
                can_be_enqueued: true,
                send_intent_not_recognized: true
            }
        }
    })
}