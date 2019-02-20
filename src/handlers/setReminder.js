const { reminderFactory } = require('../factories')
const { logger } = require('../utils')
const commonHandler = require('./common')

// Create a new reminder and save it into the file system
module.exports = async function (msg, flow) {

    let res = null

    logger.debug('SetReminder')
    //logger.debug(reminderFactory.get())

    const slots = await commonHandler(msg)

    if (slots.reminder_name && (slots.recurrence || slots.datetime)) {
        logger.debug('Completed slots')
        res = reminderFactory.addReminder(slots.reminder_name, slots.datetime, slots.recurrence)
    } else {
        logger.debug('Incompleted slots')
        // start the slots-filler or continue the session to ask again

        res = 'Incompleted slots values, please try again'
    }

    flow.end()
    return res
}