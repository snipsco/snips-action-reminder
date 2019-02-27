const i18nFactory = require('../factories/i18nFactory')

module.exports = (reminders, pastRemidners = false) => {
    const i18n = i18nFactory.get()

    let message = i18n(pastRemidners ? 'inform.numberOfPastReminders' : 'inform.numberOfComingReminders', {
        number: reminders.length
    })

    reminders.forEach(reminder => {
        message += i18n('inform.reminderSetFor', {
            reminder_name: reminder.name,
            date_time: reminder.datetime.toLocaleString('fr-FR', {
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'}),
            recurrence: reminder.recurrence
        })
        message += ' '
    })
    return message
}