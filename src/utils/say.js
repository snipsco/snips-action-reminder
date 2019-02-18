const { Hermes, Dialog } = require('hermes-javascript')

module.exports = (text, site_id='default') => {
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