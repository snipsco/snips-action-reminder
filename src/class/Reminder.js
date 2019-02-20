const cron = require('node-cron')
const timestamp = require('time-stamp')
const fs = require('fs')
const path = require('path')

const { i18nFactory } = require('../factories')
const { logger } = require('../utils')
const { ask } = require('../tts')

module.exports = class Reminder {

    constructor (name, datetime, recurrence, id = null) {
        if (!name || !(datetime || recurrence)){
            throw new Error('incompleteReminderCreationInfo')
        }

        this.statusReminder = false
        this.alarmStatus = false

        this.id = (id) ? id : timestamp('YYYYMMDD-HHmmss-ms')

        this.name = name
        this.datetime = (datetime) ? datetime : new Date(Date.now())
        this.recurrence = recurrence

        this.schedule = Reminder.parseSchedule(this.datetime, this.recurrence)

        // when the task arrives, start alarm cron which play tts and wait for a user respond each 10 seconds
        this.taskAlarm = cron.schedule('*/10 * * * * *', this.alarm, {
            scheduled: false
        })

        this.taskReminder = cron.schedule(this.schedule, this.enableAlarm, {
            scheduled: false
        })
    }

    alarm () {
        const i18n = i18nFactory.get()
        let message = i18n('info.remind', { reminder: this.name })
        ask(message, {reminder_id: this.id, reminder_name: this.name})
    }

    enable () {
        this.statusReminder = true
        this.taskReminder.start()
    }

    disable () {
        this.statusReminder = false
        this.taskReminder.stop()
    }

    enableAlarm () {
        this.statusAlarm = true
        this.taskAlarm.start()
    }

    disableAlarm () {
        this.statusAlarm = false
        this.taskAlarm.stop()
    }

    delete () {
        // delete task cron object
        this.disable()
        this.task.destory()

        // delete alarm crom object
        this.disableAlarm()
        this.alarm.destory()

        // delete the saved reminder in the FS
        let reminderSavedPath = path.resolve(__dirname + `/../../reminder_records/${this.id}.json`)
        fs.unlink(reminderSavedPath, (err) => {
            if (err) {
                return logger.error(err)
            }
            logger.info(`Deleted reminder: ${reminderSavedPath}`)
        })
    }

    save () {
        let data = JSON.stringify({
            id: this.id,
            name: this.name,
            recurrence: this.recurrence,
            schedule: this.schedule
        })

        let reminderSavePath = path.resolve(__dirname + `/../../reminder_records/${this.id}.json`)

        fs.writeFile(reminderSavePath, data, 'utf8', (err) => {
            if (err) {
                return logger.error(err);
            }
            logger.info(`Saved reminder: ${reminderSavePath}`)
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
    static parseSchedule (datetime, recurrence=null) {
        let schedule = ''
        switch (recurrence) {
            case 'mondays':
                schedule = `${datetime.getMinutes()} ${datetime.getHours()} * * Mon`
                break

            case 'tuesdays':
                schedule = `${datetime.getMinutes()} ${datetime.getHours()} * * Tue`
                break

            case 'wednesdays':
                schedule = `${datetime.getMinutes()} ${datetime.getHours()} * * Wed`
                break

            case 'thursdays':
                schedule = `${datetime.getMinutes()} ${datetime.getHours()} * * Thu`
                break

            case 'fridays':
                schedule = `${datetime.getMinutes()} ${datetime.getHours()} * * Fri`
                break

            case 'saturdays':
                schedule = `${datetime.getMinutes()} ${datetime.getHours()} * * Sat`
                break

            case 'sundays':
                schedule = `${datetime.getMinutes()} ${datetime.getHours()} * * Sun`
                break

            case 'weekly':
                schedule = `${datetime.getMinutes()} ${datetime.getHours()} * * ${datetime.getDay()}`
                break

            case 'daily':
                schedule = `${datetime.getMinutes()} ${datetime.getHours()} * * *`
                break

            case 'monthly':
                schedule = `${datetime.getMinutes()} ${datetime.getHours()} * * ${datetime.getDay()}`
                break

            case 'weekends':
                schedule = `${datetime.getMinutes()} ${datetime.getHours()} * * Sat,Sun`
                break

            default:
                schedule = `${datetime.getMinutes()} ${datetime.getHours()} ${datetime.getDate()} ${datetime.getMonth()+1} ${datetime.getDay()}`
        }

        if (!cron.validate(schedule)) {
            logger.error('unvalideScheduleExpression')
        }
        return schedule
    }

    dumpReminderInfo () {
        var datetimeNow = new Date(Date.now())
        logger.info('---------------------------------')
        logger.info(`Current time .......... ${datetimeNow.toLocaleString('en-GB')}`)
        logger.info(`Target time ........... ${this.datetime.toLocaleString('en-GB')}`)
        logger.info(`Reminder id ........... ${this.id}`)
        logger.info(`Reminder name ......... ${this.name}`)
        if (this.recurrence){
            logger.info(`Reminder recurrence ... ${this.recurrence}`)
        } else {
            logger.info('Reminder recurrence ... NONE')
        }
        logger.info(`Reminder schedule ..... ${this.schedule}`)
        logger.info('---------------------------------')
    }
}