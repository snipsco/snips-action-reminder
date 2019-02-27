const { logger } = require('../utils')

module.exports = async function (msg, flow) {
    logger.debug('no')

    flow.end()
}