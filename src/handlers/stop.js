const { logger } = require('../utils')
const { deleteAlarm } = require('../alarms')
const { setExpiredOrNewDatetimeById } = require('../reminders')

module.exports = async function (msg, flow) {
    logger.debug('Stop')
    if (!msg.customData) {
        flow.end()
        logger.debug('Terminated session')
        return
    }

    const customData = JSON.parse(msg.customData)
    deleteAlarm(customData.reminder_id)
    setExpiredOrNewDatetimeById(customData.reminder_id)
    flow.end()
}