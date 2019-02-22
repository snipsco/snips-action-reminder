const { logger } = require('../utils')

module.exports = async function (msg, flow) {
    logger.debug('No')
    if (!msg.custom_data) {
        flow.end()
        logger.debug('Terminated session')
    }
    customData = JSON.parse(msg.custom_data)
    G_allReminders.stopReminderAlarmById(customData.reminder_id)
    flow.end()
}