const api = require('../api')
const { i18nFactory } = require('../factories')
const { message } = require('../utils')
const Reminder = require('../utils/').reminder

// Brief:
//     Create a new reminder and save it into the file system
module.exports = async function (msg, flow) {
    console.log('setReminder callback')
    var success = 1

    var r_name = ''
    var r_datetime = ''
    var r_recurrence = ''

    const reminder_name = message.getSlotsByName(msg, 'reminder_name', { onlyMostConfident: true, threshold: 0.5 })
    const datetime = message.getSlotsByName(msg, 'datetime', { onlyMostConfident: true, threshold: 0.5 })
    const recurrence = message.getSlotsByName(msg, 'recurrence', { onlyMostConfident: true, threshold: 0.5 })

    if(reminder_name) {
        r_name = reminder_name.value.value
    }
    if(datetime) {
        r_datetime = datetime.value.value.value
        console.log(r_datetime)
    }

    if(recurrence) {
        r_recurrence = recurrence.value.value
    }

    const i18n = i18nFactory.get()
    try {
        rem = new Reminder(r_name, r_datetime, r_recurrence)
        REMINDERS.push(rem)
        console.log(`Current reminder number: ${REMINDERS.length}`)

        var options = {year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric"};
        res = i18n('info.confirmReminderSet', {
            name: rem.name,
            date_time: rem.datetime.toLocaleString('fr-FR', options),
            recurrence: r_recurrence
        })
    } catch (e) {
        console.log(e)
        res = i18n('error.incomplete')
    }

    flow.end()
    return res
}