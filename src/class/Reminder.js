const cron = require('node-cron')
const timestamp = require('time-stamp')
const fs = require("fs")
const path = require('path')

const { i18nFactory } = require('../factories')
const say = require('../utils/').say

module.exports = class Reminder {

    constructor (name, datetime, recurrence) {
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
            const i18n = i18nFactory.get()
            say(i18n('info.remind', { reminder: this.name }))
            console.log(`Reminder task <${this.name}> is triggered`)
        }, {
            scheduled: false
        })
    }

    debug_dump () {
        var date_now = new Date(Date.now())
        console.log(`Current time ................ ${date_now.toLocaleString("en-GB")}`)
        console.log(`Target time ................. ${this.datetime.toLocaleString("en-GB")}`)
        console.log(`Reminder id ................. ${this.id}`)
        console.log(`Reminder name ............... ${this.name}`)
        if (this.recurrence)
            console.log(`Reminder recurrence ......... ${this.recurrence}`)
        else
            console.log(`Reminder recurrence ......... NONE`)
        console.log(`Reminder schedule ........... ${this.schedule}`)
    }

    save () {
        let data = JSON.stringify({
            id: this.id,
            name: this.name,
            recurrence: this.recurrence,
            schedule: this.schedule
        })
        let reminder_path = path.resolve(__dirname + `/../../reminder_records/${this.id}.json`)

        fs.writeFile(reminder_path, data, 'utf8', (err, reminder_path) => {
            if (err) {
                return console.error(err);
            }
            console.log(`Successfully write file ${reminder_path}`)
        })
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
    static parseSchedule (date, recurrence=null) {
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
                schedule = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth()+1} ${date.getDay()}`
        }
        return schedule
    }

    static parse_date_time (date_time_raw) {
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