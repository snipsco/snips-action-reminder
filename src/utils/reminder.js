const cron = require('node-cron')
const timestamp = require('time-stamp')

module.exports = class Reminder {

    constructor(name, datetime, recurrence) {
        if (!name || !(datetime || recurrence))
            throw "[Create Reminder faild] Incomplete information"
        this.id = timestamp('YYYYMMDD-HHmmss-ms')
        this.name = name
        if (datetime)
            this.datetime = Reminder.parse_date_time(datetime)
        else
            this.datetime = new Date(Date.now())
        this.recurrence = recurrence
        this.schedule = Reminder.parseSchedule(this.datetime, this.recurrence)
        this.task = cron.schedule(this.schedule, () => {
          console.log(`Reminder task <${this.name}> is arrive`);
        })
        this.debug_dump()
    }

    debug_dump() {
        console.log(`Reminder id ................. ${this.id}`)
        console.log(`Reminder name ............... ${this.name}`)
        if (this.recurrence)
            console.log(`Reminder recurrence ......... ${this.recurrence}`)
        else
            console.log(`Reminder recurrence ......... NONE`)
        console.log(`Reminder schedule ........... ${this.schedule}`)
    }

    // ┌────────────── second (optional, not used)
    // │ ┌──────────── minute
    // │ │ ┌────────── hour
    // │ │ │ ┌──────── day of month
    // │ │ │ │ ┌────── month
    // │ │ │ │ │ ┌──── day of week
    // │ │ │ │ │ │
    // │ │ │ │ │ │
    // * * * * * *
    static parseSchedule(date, recurrence=null) {
        var schedule = ''
        switch (recurrence) {
            case 'mondays':
                schedule = `${date.getMinutes()} ${date.getHours()} * * Mon`
                break

            case 'tuesdays':
                schedule = `${date.getMinutes()} ${date.getHours()} * * Tue`
                break

            case 'wednesdays':
                schedule = `${date.getMinutes()} ${date.getHours()} * * Wed`
                break

            case 'thursdays':
                schedule = `${date.getMinutes()} ${date.getHours()} * * Thu`
                break

            case 'fridays':
                schedule = `${date.getMinutes()} ${date.getHours()} * * Fri`
                break

            case 'saturdays':
                schedule = `${date.getMinutes()} ${date.getHours()} * * Sat`
                break

            case 'sundays':
                schedule = `${date.getMinutes()} ${date.getHours()} * * Sun`
                break

            case 'weekly':
                schedule = `${date.getMinutes()} ${date.getHours()} * * ${date.getDay()}`
                break

            case 'daily':
                schedule = `${date.getMinutes()} ${date.getHours()} * * *`
                break

            case 'monthly':
                schedule = `${date.getMinutes()} ${date.getHours()} * ${date.getMonth()+1} *`
                break

            case 'weekends':
                schedule = `${date.getMinutes()} ${date.getHours()} * * Sat,Sun`
                break

            default:
                console.log("No recurrence task")
                schedule = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth()+1} ${date.getDay()}`
        }
        return schedule
    }

    static parse_date_time(date_time_raw) {
        var date_time = {}

        var temp = date_time_raw.split(' ')
        var date = temp[0]
        var time = temp[1]

        temp = date.split('-')
        var year = parseInt(temp[0])
        var month = parseInt(temp[1])
        var day = parseInt(temp[2])

        temp = time.split(':')
        var hour = parseInt(temp[0])
        var minutes = parseInt(temp[1])

        var res = new Date(year, month-1, day, hour, minutes)
        return res
    }
}