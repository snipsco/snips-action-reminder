const i18nFactory = require('../factories/i18nFactory')

function isToday(datetime) {
    const today = new Date(Date.now())
    return (
        today.getDate() === datetime.getDate() &&
        today.getMonth() === datetime.getMonth() &&
        today.getFullYear() === datetime.getFullYear()
    )
}

function isTomorrow(datetime) {
    const today = new Date(Date.now())
    const tomorrow = new Date(today.getTime() + 1000 * 60 * 60 * 24)
    return (
        tomorrow.getDate() === datetime.getDate() &&
        tomorrow.getMonth() === datetime.getMonth() &&
        tomorrow.getFullYear() === datetime.getFullYear()
    )
}

function isThisWeek(datetime) {
    // calculate the week number from the first day of year
    // if they own the same year and same week number, then it's the same week
    // make it work tomorrow
    const today = new Date(Date.now())
    const weekStart = today.getTi()
    const weekEnd =
}

function isNextWeek(datetime) {

}

function isThisMonth(datetime) {

}

function isNextMonth(datetime) {

}

function isThisYear(datetime) {
    const today = new Date(Date.now())
    return (
        datetime.getFullYear() === today.getFullYear()
    )
}

// function isWeekdays(recurrence) {
//     const weekdays = [
//         'mondays',
//         'tuesdays',
//         'wednesdays',
//         'thursdays',
//         'fridays',
//         'saturdays',
//         'sundays',
//         'weekly'
//     ]
//     return (weekdays.indexOf(recurrence) + 1)
// }

/**
 * @brief Refering to the currenct datetime, generate a nice human understood TTS message
 *
 * @param {Date Object} datetime, used to generate tts message
 * @param {String} recurence
 * @return {String} tts message that is ready to play
 */
 function getTimeHuman(datetime, recurrence) {
     const i18n = i18nFactory.get()

     const year = isThisYear(datetime) ? '' : datetime.getFullYear()
     const month = i18n(`months.${datetime.getMonth()}`)
     const date = datetime.getDate()
     const time = datetime.toLocaleString('en-US', {
         hour12: true,
         hour: 'numeric',
         minute: 'numeric'
     }).replace(':', ' ').replace('00','')

     if (recurrence) {
         if (recurrence == 'weekly') {
             // "Every Tuesday at 11 55 PM"
             return i18n('time.every_At_', {
                 day: i18n(`weekdays.${datetime.getDay()}`),
                 time: time
             })
         } else if (recurrence == 'monthly'){
             // "Every 1 of Month at 11 55 PM"
             return i18n('time.every_ofMonthAt_', {
                 day: datetime.getDate(),
                 time: time
             })
         } else {
             // "Every Saturday and Sunday at 11 55 PM"
             // "Every day at 11 55 PM"
             return i18n('time.every_At_', {
                 day: i18n(`recurrences.${recurrence}`),
                 time: time
             })
         }
     } else {
         if (isToday(datetime)) {
             // "Today at 11 55 PM"
             return i18n('time.todayAt_', {
                 time: time
             })
         } else if (isTomorrow(datetime)) {
             // "Tomorrow at 11 55 PM"
             return i18n('time.tomorrowAt_', {
                 time: time
             })
         } else {
             // "March 2 at 11 55 PM"
             return i18n('time.oneDayAt_', {
                 month: month,
                 date: date,
                 time: time,
                 year: year
             })
         }
     }
 }

// instant time input
function getTimeHumanRough(datetimeSnips) {
    const i18n = i18nFactory.get()
    const datetime = new Date(datetimeSnips)
    if (datetimeSnips.grain === 'Minute') {
        // "this time"
        return i18n('getReminders.info.thisTime')
    }
    if (datetimeSnips.grain === 'Day') {
        // "today" / "tomorrow" / "March 2"
        if (isToday(datetime)) {
            return i18n('getReminders.info.today')
        } else if (isTomorrow(datetime)) {
            return i18n('getReminders.info.tomorrow')
        } else {
            return i18n('getReminders.info.monthDate', {
                month: i18n(`months.${datetime.getMonth()}`),
                date: datetime.getDate()
            })
        }
    }
    if (datetimeSnips.grain === 'Week') {
        // "this week" / "next week"

    }

    if (datetimeSnips.grain === 'Month') {
        // "this month" / "next month" / "april"

    }

    if (datetimeSnips.grain === 'Year') {
        // "this year" / "2020"

    }
}

function getRecurrenceHuman() {

}

module.exports = {
    getTimeHuman,
    getTimeHumanRough,
    getRecurrenceHuman
}