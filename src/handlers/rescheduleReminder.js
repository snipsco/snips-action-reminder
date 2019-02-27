const { logger } = require('../utils')

module.exports = async function (msg, flow) {
    logger.debug('rescheduleReminder')

    flow.end()
}