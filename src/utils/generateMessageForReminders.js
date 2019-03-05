const i18nFactory = require('../factories/i18nFactory')
generateDatetimeTTS = require('../tts/generateDatetimeTTS')

module.exports = (reminders, pastRemidners = false) => {
    const i18n = i18nFactory.get()

    let message = i18n(pastRemidners ? 'inform.numberOfPastReminders' : 'inform.numberOfComingReminders', {
        number: reminders.length
    })
    
    // always report the latest coming reminder first, then later
    reminders.sort( (a, b) => {
        return (a.datetime.getTime() - b.datetime.getTime())
    })

    reminders.forEach(reminder => {
        message += i18n('inform.reminderSetFor', {
            reminder_name: reminder.name,
            date_time: generateDatetimeTTS(reminder.datetime),
            recurrence: reminder.recurrence
        })
        message += ' '
    })
    return (reminders.length > 5) ? '' : message
}