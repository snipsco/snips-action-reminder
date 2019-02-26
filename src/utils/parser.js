const cron = require('node-cron')
const { GRAIN_TO_STRING } = require('../constants')

/**
 * Convert a incompleted datetime to a exact time, filling the unclear parts by current time sub-segments
 * A uncompleted datetime example: '2020-01-01 00:00:00 +01:00' (Next year)
 * A completed datetime example: '2020-03-26 16:39:00 +01:00' (A year after from today)
 *
 * @param {Date Object} datetime
 * @return {Date Object} (precision: minute)
 */
 function getCompletedDatetime(datetime) {
     const datetimeNow = new Date(Date.now())
     let completedDatetime = new Date(datetime.value)

     switch (GRAIN_TO_STRING[datetime.grain]) {
         case 'Minute':// base: exact at YYYY-MM-DD HH-MM
             return completedDatetime
         case 'Hour':// base: the next hour at HH:00
             completedDatetime.setMinutes(datetimeNow.getMinutes())
             return completedDatetime
         case 'Day':// base: the next day at 00:00
             completedDatetime.setHours(datetimeNow.getHours())
             completedDatetime.setMinutes(datetimeNow.getMinutes())
             return completedDatetime
         case 'Week':// base: the first day of next weeek at 00:00
             completedDatetime.setDate(completedDatetime.getDate() + datetimeNow.getDay() - 1)
             completedDatetime.setHours(datetimeNow.getHours())
             completedDatetime.setMinutes(datetimeNow.getMinutes())
             return completedDatetime
         case 'Month':// base: the first day of month at 00:00
             completedDatetime.setDate(datetimeNow.getDate())
             completedDatetime.setHours(datetimeNow.getHours())
             completedDatetime.setMinutes(datetimeNow.getMinutes())
             return completedDatetime
         case 'Year':// base: the first day of year at 00:00
             completedDatetime.setMonth(datetimeNow.getMonth() + 1)
             completedDatetime.setDate(datetimeNow.getDate())
             completedDatetime.setHours(datetimeNow.getHours())
             completedDatetime.setMinutes(datetimeNow.getMinutes())
             return completedDatetime
         default:// base: exact at YYYY-MM-DD HH-MM-SS
             return completedDatetime
     }
 }

/**
 * convert a datetime and recurrence to a cron schedule expression
 *
 *     ┌────────────── second
 *     │ ┌──────────── minute
 *     │ │ ┌────────── hour
 *     │ │ │ ┌──────── day of month
 *     │ │ │ │ ┌────── month
 *     │ │ │ │ │ ┌──── day of week
 *     │ │ │ │ │ │
 *     │ │ │ │ │ │
 *     * * * * * *
 *
 * @param {Object} datetime
 * @param {String} recurrence
 * @return {String} cron schedule expression composed of 6 segments
 */
function getScheduleString (datetime, recurrence=null) {
    const mapper = {
        mondays: '* * Mon',
        tuesdays: '* * Tue',
        wednesdays: '* * Wed',
        thursdays: '* * Thu',
        fridays: '* * Fri',
        satuardays: '* * Sat',
        sundays: '* * Sun',
        weekly: `* * ${datetime.getDay()}`,
        daily: '* * *',
        monthly: `${datetime.getDate()} * *`,
        weekend: '* * Sat,Sun',
    }

    let schedule = `${datetime.getSeconds()} ${datetime.getMinutes()} ${datetime.getHours()} `

    if (recurrence) {
        schedule += mapper[recurrence]
    } else {
        schedule += `${datetime.getDate()} ${datetime.getMonth()+1} ${datetime.getDay()}`
    }
    if (!cron.validate(schedule)) {
        throw 'invalideCronScheduleExpression'
    }
    return schedule
}

module.exports = {
    getCompletedDatetime,
    getScheduleString
}