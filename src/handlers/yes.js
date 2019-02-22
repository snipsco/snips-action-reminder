const { logger } = require('../utils')

module.exports = async function (msg, flow) {
    logger.debug('Yes')
    if (!msg.custom_data) {
        flow.end()
        logger.debug('Terminated session')
    }

    reminderFactory.stopAlarmById(msg.custom_data.reminder_id)
    flow.end()
}