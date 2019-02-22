const cron = require('node-cron')
const timestamp = require('time-stamp')
const fs = require('fs')
const path = require('path')
const { logger, parser } = require('../utils')
const { ask } = require('../tts')
const i18nFactory = require('../factories/i18nFactory')

module.exports = class Reminder {

    constructor (name, datetime = null, recurrence = null, id = null) {
        if (!name || !(datetime || recurrence)){
            throw 'incompleteReminderCreationInfo'
        }

        this.id = (id) ? id : timestamp('YYYYMMDD-HHmmss-ms')
        this.name = name
        this.datetime = new Date((datetime) ? datetime : Date.now())
        this.recurrence = recurrence
        this.schedule = parser.getScheduleString(this.datetime, this.recurrence)

        this.expired = false
        this.statusReminder = false
        this.alarmStatus = false

        // when the task arrives, start alarm cron which play tts and wait for a user respond each 10 seconds
        this.taskAlarm = cron.schedule('*/15 * * * * *', () => {
            const i18n = i18nFactory.get()
            let message = i18n('info.remind', {
                name: this.name
            })
            // customData only supports string type
            ask(message, JSON.stringify({
                reminder_id: this.id,
                reminder_name: this.name}))
        }, {
            scheduled: false
        })

        this.taskReminder = cron.schedule(this.schedule, () => {
            this.statusAlarm = true
            this.taskAlarm.start()
        }, {
            scheduled: false
        })
    }

    enable () {
        this.statusReminder = true
        this.taskReminder.start()
    }

    disable () {
        this.statusReminder = false
        this.taskReminder.stop()
        logger.debug(`Disabled reminder: ${this.id}`)
    }

    enableAlarm () {
        this.statusAlarm = true
        this.taskAlarm.start()
    }

    disableAlarm () {
        this.statusAlarm = false
        this.taskAlarm.stop()
        logger.info(`Reminder: ${this.id}'s alarm is disabled`)
        if (!this.recurrence) {
            this.expired = true
            logger.info(`Reminder: ${this.id} is expired`)
        }
    }

    delete () {
        // delete task cron object
        this.disable()
        this.taskReminder.destroy()

        // delete alarm crom object
        this.disableAlarm()
        this.taskAlarm.destroy()

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
            datetime: this.datetime.toJSON(),
            recurrence: this.recurrence,
            schedule: this.schedule
        })

        let reminderSavePath = path.resolve(__dirname + `/../../reminder_records/${this.id}.json`)

        fs.writeFile(reminderSavePath, data, 'utf8', (err) => {
            if (err) {
                return logger.error(err);
            }
            logger.info(`Saved reminder: ${this.id}.json`)
        })
    }

    dumpReminderInfo () {
        var datetimeNow = new Date(Date.now())
        logger.debug(`===== ${this.id} =====`)
        logger.debug(`Name ......... ${this.name}`)
        logger.debug(`C_time ....... ${datetimeNow.toLocaleString('en-US')}`)
        logger.debug(`T_time ....... ${this.datetime.toLocaleString('en-US')}`)
        logger.debug(`Recurrence ... ${(this.recurrence) ? this.recurrence : 'NONE'}`)
        logger.debug(`Schedule ..... ${this.schedule}`)
        logger.debug('=================================')
    }
}