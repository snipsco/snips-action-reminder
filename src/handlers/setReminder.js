const api = require('../api')
const { i18nFactory } = require('../factories')
const { message, logger } = require('../utils')
const commonHandler = require('./common')

const Reminder = require('../class/').Reminder

//Create a new reminder and save it into the file system
module.exports = async function (msg, flow) {
    const i18n = i18nFactory.get()

    logger.info('SetReminder')

    var success = 1

    const slots = await commonHandler(msg, knownSlots = {} )

    if (slots.reminder_name && (slots.recurrence || slots.datetime)) {
        res = 'all the slots are good'
        logger.info('all the slots are good')
    } else {
        res = 'incompleted slots'
        logger.info('incompleted slots')
    }

    // try {
    //     rem = new Reminder(r_name, r_datetime, r_recurrence)
    //     REMINDERS.push(rem)
    //     console.log(`Current reminder number: ${REMINDERS.length}`)
    //
    //     var options = {month: "long", day: "numeric", hour: "numeric", minute: "numeric"};
    //     res = i18n('info.confirmReminderSet', {
    //         name: rem.name,
    //         date_time: rem.datetime.toLocaleString('fr-FR', options),
    //         recurrence: r_recurrence
    //     })
    // } catch (e) {
    //     console.log(e)
    //     res = i18n('error.incomplete')
    // }

    flow.end()
    return res
}