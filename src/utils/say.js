const { Hermes, Dialog } = require('hermes-javascript')
const logger = require('./logger')

module.exports = (text, site_id='default') => {
    logger.info(text)

    const hermes = new Hermes()
    const dialog = hermes.dialog()
    dialog.publish('start_session', {
        site_id: site_id,
        session_init: {
            init_type:  Dialog.enums.initType.notification,
            value: text
        }
    })
}