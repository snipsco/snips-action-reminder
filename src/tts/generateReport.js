const i18nFactory = require('../factories/i18nFactory')
const { getTimeHuman, getTimeHumanRough, getRecurrenceHuman } = require('./generateTime')

function getHead(i18n, foundReminders, querySlots = {}, isPast = false) {
    // "I'v found <number> reminder(s) named <name>"
    if (querySlots.reminder_name && !querySlots.datetime && !querySlots.recurrence) {
        return i18n('getReminders.info.found_RemindersNamed_', {
            number: foundReminders.length,
            adj: isPast ? 'past' : '',
            odd: foundReminders.length > 1 ? 's' : '',
            name: querySlots.reminder_name
        })
    }

    // "I'v found <number> reminder(s) set for <timeRough>"
    if (!querySlots.reminder_name && querySlots.datetime && !querySlots.recurrence) {
        return i18n('getReminders.info.found_RemindersSetFor_', {
            number: foundReminders.length,
            adj: isPast ? 'past' : '',
            odd: foundReminders.length > 1 ? 's' : '',
            time: getTimeHumanRough(querySlots.datetime)
        })
    }

    // "I'v found <number> reminder(s) set for every <recurrence>"
    if (!querySlots.reminder_name && !querySlots.datetime && querySlots.recurrence) {
        return i18n('getReminders.info.found_RemindersSetForEvery_', {
            number: foundReminders.length,
            adj: isPast ? 'past' : '',
            odd: foundReminders.length > 1 ? 's' : '',
            recurrence: getRecurrenceHuman(querySlots.recurence)
        })
    }

    // "I'v found <number> reminder(s) named <name> and set for <recurrence>"
    if (querySlots.reminder_name && querySlots.datetime && !querySlots.recurrence) {
        return i18n('getReminders.info.found_RemindersNamed_AndSetFor_', {
            number: foundReminders.length,
            adj: isPast ? 'past' : '',
            odd: foundReminders.length > 1 ? 's' : '',
            name: querySlots.reminder_name,
            time: getTimeHumanRough(querySlots.datetime)
        })
    }

    // "I'v found <number> reminder(s) named <name> and set for <time>"
    if (querySlots.reminder_name && querySlots.datetime && querySlots.recurrence) {
        return i18n('getReminders.info.found_RemindersNamed_AndSetForEvery_', {
            number: foundReminders.length,
            adj: isPast ? 'past' : '',
            odd: foundReminders.length > 1 ? 's' : '',
            name: querySlots.reminder_name,
            recurence: getRecurrenceHuman(querySlots.recurence)
        })
    }

    // "I'v found <number> reminder(s)"
    if (!querySlots.reminder_name && !querySlots.datetime && !querySlots.recurrence) {
        return i18n('getReminders.info.found_Reminders', {
            number: foundReminders.length,
            adj: isPast ? 'past' : '',
            odd: foundReminders.length > 1 ? 's' : ''
        })
    }
}

// "The most recent one is: <name> set for <time>"
function getRecent(i18n, foundReminders, grain) {
    let messageHead = i18n('getReminders.info.theMostRecentIs')
    let messageContent = i18n('getReminders.info.reminder_SetFor_', {
        name: foundReminders[0].name,
        time: getTimeHuman(foundReminders[0].datetime, null, grain)
    })
    return foundReminders.length === 1 ? messageContent : messageHead + messageContent
}

// "The rest reminder(s) are: <name> set for <time>"
function getRest(i18n, foundReminders, grain) {
    let message = i18n('getReminders.info.theRestRemindersAre', {
        odd: foundReminders.length > 2 ? 's' : '',
        be: foundReminders.length > 2 ? 'are' : 'is'
    })
    for (let i = 1; i < foundReminders.length; i++) {
        message += i18n('getReminders.info.reminder_SetFor_', {
            name: foundReminders[i].name,
            time: getTimeHuman(foundReminders[i].datetime, null, grain)
        })
    }
    return foundReminders.length > 1 ? message : ''
}

// "<name> set for <time> "
function getDetail(i18n, foundReminders, grain) {
    let message = ''
    for (let i = 0; i < foundReminders.length; i++) {
        message += i18n('getReminders.info.reminder_SetFor_', {
            name: foundReminders[i].name,
            time: getTimeHuman(foundReminders[i].datetime, null, grain)
        })
    }
    return message
}

module.exports = (foundReminders, querySlots = {}, isPast = false) => {
    const i18n = i18nFactory.get()
    const grain = (querySlots.datetime) ? querySlots.datetime.grain : 'Year'
    return {
        head: getHead(i18n, foundReminders, querySlots, isPast),
        recent: getRecent(i18n, foundReminders, grain),
        rest: getRest(i18n, foundReminders, grain),
        all: getDetail(i18n, foundReminders, grain)
    }
}