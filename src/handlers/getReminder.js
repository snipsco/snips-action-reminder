const { logger } = require('../utils')

module.exports = async function (msg, flow) {
    logger.debug('getReminder')

    flow.end()
    return 'This is get reminder callback'
}