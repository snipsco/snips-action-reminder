const i18nFactory = require('../factories/i18nFactory')
const { getTimeHuman, getTimeHumanRough, getRecurrenceHuman } = require('./generateTime')

// "I'v found <number> reminders ..."
function getHead(i18n, foundReminders, querySlots = {}, isPast = false) {
    let pattern = 0
    pattern += querySlots.reminder_name ? 4 : 0
    pattern += querySlots.datetime ? 2 : 0
    pattern += querySlots.recurrence ? 1 : 0
    const messageMapper = {
        4: i18n('getReminders.info.found_RemindersNamed_', {
            number: foundReminders.length,
            adj: isPast ? 'past' : '',
            odd: foundReminders.length > 1 ? 's' : '',
            name: querySlots.reminder_name
        }),
        2: i18n('getReminders.info.found_RemindersSetFor_', {
            number: foundReminders.length,
            adj: isPast ? 'past' : '',
            odd: foundReminders.length > 1 ? 's' : '',
            // need to have detail
            datetime: getTimeHumanRough(new Date(querySlots.datetime))
        }),
        1: i18n('getReminders.info.found_RemindersSetForEvery_', {
            number: foundReminders.length,
            adj: isPast ? 'past' : '',
            odd: foundReminders.length > 1 ? 's' : '',
            recurrence: getRecurrenceHuman(querySlots.recurence)
        }),
        6: i18n('getReminders.info.found_RemindersNamed_AndSetFor_', {
            number: foundReminders.length,
            adj: isPast ? 'past' : '',
            odd: foundReminders.length > 1 ? 's' : '',
            name: querySlots.reminder_name,
            datetime: getTimeHuman(new Date(querySlots.datetime))
        }),
        5: i18n('getReminders.info.found_RemindersNamed_AndSetForEvery_', {
            number: foundReminders.length,
            adj: isPast ? 'past' : '',
            odd: foundReminders.length > 1 ? 's' : '',
            name: querySlots.reminder_name,
            recurence: getTimeHumanRough(querySlots.recurence)
        }),
        0: i18n('getReminders.info.found_RemindersNamed_', {
            number: foundReminders.length,
            adj: isPast ? 'past' : '',
            odd: foundReminders.length > 1 ? 's' : '',
            name: querySlots.reminder_name
        })
    }
    return messageMapper[pattern]
}

// "The most recent one is: <name> set for <time>"
function getRecent(i18n, foundReminders) {
    let messageHead = i18n('getReminders.info.theMostRecentIs')
    let messageContent = i18n('getReminder.info.reminder_SetFor_', {
        name: foundReminders[0].name,
        time: getTimeHuman(foundReminders[0].datetime)
    })
    return foundReminders.length === 1 ? messageContent : messageHead + messageContent
}

// "The rest reminder(s) are: <name> set for <time>"
function getRest(i18n, foundReminders) {
    let message = i18n('getReminders.info.theRestRemindersAre', {
        odd: foundReminders.length > 2 ? 's' : '',
        be: foundReminders.length > 2 ? 'are' : 'is'
    })
    for (let i = 1; i < foundReminders.length; i++) {
        message += i18n('getReminder.info.reminder_SetFor_', {
            name: foundReminders[i].name,
            time: getTimeHuman(foundReminders[i].datetime)
        })
    }
    return foundReminders.length > 1 ? message : ''
}

// "<name> set for <time> "
function getDetail(i18n, foundReminders) {
    let message = ''
    for (let i = 0; i < foundReminders.length; i++) {
        message += i18n('getReminder.info.reminder_SetFor_', {
            name: foundReminders[i].name,
            time: getTimeHuman(foundReminders[i].datetime)
        })
    }
    return message
}

module.exports = (foundReminders, querySlots = {}, isPast = false) => {
    const i18n = i18nFactory.get()

    return {
        head: getHead(i18n, foundReminders, querySlots, isPast),
        recent: getRecent(i18n, foundReminders),
        rest: getRest(i18n, foundReminders),
        all: getDetail(i18n, foundReminders)
    }
}