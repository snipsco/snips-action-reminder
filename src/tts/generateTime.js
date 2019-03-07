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
    let thisWeek = new Date(Date.now())
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay())
    let thatWeek = datetime
    thatWeek.setDate(thatWeek.getDate() - thatWeek.getDay())
    return (
        thisWeek.getDate() === thatWeek.getDate() &&
        thisWeek.getMonth() === thatWeek.getMonth() &&
        thisWeek.getFullYear() === thatWeek.getFullYear()
    )
}

function isNextWeek(datetime) {
    let nextWeek = new Date(Date.now())
    nextWeek.setDate(nextWeek.getDate() - nextWeek.getDay() + 7)
    let thatWeek = datetime
    thatWeek.setDate(thatWeek.getDate() - thatWeek.getDay())
    return (
        nextWeek.getDate() === thatWeek.getDate() &&
        nextWeek.getMonth() === thatWeek.getMonth() &&
        nextWeek.getFullYear() === thatWeek.getFullYear()
    )
}

function isThisMonth(datetime) {
    const today = new Date(Date.now())
    return (
        today.getMonth() === datetime.getMonth() &&
        today.getFullYear() === datetime.getFullYear()
    )
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

 function getTimeHuman(datetime, recurrence, grain = 'Year') {
     const i18n = i18nFactory.get()

     const year = isThisYear(datetime) ? '' : datetime.getFullYear()
     const month = i18n(`months.${datetime.getMonth()}`)
     const date = datetime.getDate()
     const day = datetime.getDay()
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
         // if the grain is 'year', 'quarter', 'month', then pronounce everyting
         // if the grain is 'week', then don't pronounce date but weekday
         // if the grain is 'day', then don't pronounce date
         // if the grain is 'hour' or 'minute', then don't pronounce time at all
         if (
             grain === 'Year'    ||
             grain === 'Quarter' ||
             grain === 'Month'   ||
             grain === 'Hour'    ||
             grain === 'Minute'  ||
             grain === 'Second'
         ) {
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
         } else if (grain === 'Week') {
             // "Monday at 11 55 PM"
             return i18n('time._At_', {
                 day: i18n(`weekdays.${day}`),
                 time: time
             })
         } else if (grain === 'Day') {
             // "11 55 PM"
             return time
         }
     }
 }

function getTimeHumanRough(datetimeSnips) {
    const i18n = i18nFactory.get()
    const datetime = new Date(datetimeSnips.value)
    if (
        datetimeSnips.grain === 'Hour'   ||
        datetimeSnips.grain === 'Minute' ||
        datetimeSnips.grain === 'Second' ||
        datetimeSnips.grain === 'Quarter'
    ) {
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
        // "this week" / "next week" / "April 4"
        if (isThisWeek(datetime)) {
            return i18n('getReminders.info.thisWeek')
        } else if (isNextWeek(datetime)) {
            return i18n('getReminders.info.nextWeek')
        } else {
            return i18n('getReminders.info.monthDate', {
                month: i18n(`months.${datetime.getMonth()}`),
                date: datetime.getDate()
            })
        }
    }

    if (datetimeSnips.grain === 'Month') {
        // "this month" / "April"
        if (isThisMonth(datetime)) {
            return i18n('getReminders.info.thisMonth')
        } else {
            return i18n(`months.${datetime.getMonth()}`)
        }
    }

    if (datetimeSnips.grain === 'Year') {
        // "this year" / "2020"
        if (isThisYear(datetime)) {
            return i18n('getReminders.info.thisYear')
        } else {
            return datetime.getFullYear()
        }
    }
}

function getRecurrenceHuman() {

}

module.exports = {
    getTimeHuman,
    getTimeHumanRough,
    getRecurrenceHuman
}