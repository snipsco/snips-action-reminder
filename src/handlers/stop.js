const { message, logger } = require('../utils')

module.exports = async function (msg, flow) {
    console.log(msg)
    flow.end()
}