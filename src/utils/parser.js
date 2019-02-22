const cron = require('node-cron')

/**
 * Convert <snips/datetime> raw date to <Date object> in JS
 * A <snips/datetime> example: '2019-02-20 09:28:33.414474992 +00:00'
 *
 * @param {string} datetimeSnips original <snips/datetime> type
 * @return {Object} <JS Date object> (precision: minute)
 */
function toJsDatetime (datetimeSnips) {
    let temp = datetimeSnips.split(' ')
    let date = temp[0]
    let time = temp[1]

    temp = date.split('-')
    let year = parseInt(temp[0])
    let month = parseInt(temp[1])
    let day = parseInt(temp[2])

    temp = time.split(':')
    let hour = parseInt(temp[0])
    let minutes = parseInt(temp[1])

    return new Date(year, month-1, day, hour, minutes)
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
    let mapper = {
        mondays: `* * Mon`,
        tuesdays: `* * Tue`,
        wednesdays: `* * Wed`,
        thursdays: `* * Thu`,
        fridays: `* * Fri`,
        satuardays: `* * Sat`,
        sundays: `* * Sun`,
        weekly: `* * ${datetime.getDay()}`,
        daily: `* * *`,
        monthly: `${datetime.getDate()} * *`,
        weekend: `* * Sat,Sun`,
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
    toJsDatetime,
    getScheduleString
}