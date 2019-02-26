const { Hermes, Dialog } = require('hermes-javascript')
const { logger } = require('../utils')

module.exports = (text, siteId='default') => {
    logger.info(text)

    const hermes = new Hermes()
    const dialog = hermes.dialog()
    dialog.publish('start_session', {
        init: {
            type: Dialog.enums.initType.notification,
            text: text,
        },
        siteId: siteId
    })
}