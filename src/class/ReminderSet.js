const fs = require('fs')
const path = require('path')
const { logger } = require('../utils')
const Reminder = require('./Reminder')

module.exports = class ReminderSet extends Set {
    constructor (remindersPath) {
        super()
        this.remindersPath = remindersPath
        this.loadSavedReminders()
    }

    addNew (reminder_name, datetime, recurrence, id = null) {
        let res = null

        try {
            let temp = new Reminder(reminder_name, datetime, recurrence, id)
            res = temp
            logger.info((id ? 'Load' : 'New') + ` reminder: ${reminder_name}`)
            temp.dumpReminderInfo()

            temp.enable()
            temp.save()
            this.add(temp)
        } catch (err) {
            logger.error(err)
            return false
        }
        return res
    }

    loadSavedReminders () {
        // get all the saved reminder
        fs.readdir(this.remindersPath, (err, files) => {
            if(err){
                logger.error(err)
            }
            logger.info(`Found ${files.length} saved reminders!`)

            // load each saved reminder to runtime system
            logger.info(files)
            files.forEach(file => {
                let reminderPath = path.resolve(`${this.remindersPath}/${file}`)
                logger.debug(`Reading: ${reminderPath}`)
                let reminderTemp = JSON.parse(fs.readFileSync(reminderPath))
                let res = this.addNew(reminderTemp.name,
                                      reminderTemp.datetime,
                                      reminderTemp.recurrence,
                                      reminderTemp.id)
                logger.info(`Loaded reminder: ${res}`)
            })
        })
    }

    disableAll() {
        this.forEach((reminder) => {
            reminder.disable()
            reminder.disableAlarm()
        })
    }

    deleteReminderById (reminderId) {
        let targetObj = null
        this.forEach((reminder) => {
            if (reminder.id == reminderId) {
                reminder.delete()
                targetObj = reminder
            }
        })

        if (targetObj) {
            this.delete(targetObj)
        }
    }

    stopReminderAlarmById (reminderId) {
        this.forEach((reminder) => {
            if (reminder.id == reminderId) {
                reminder.disableAlarm()
            }
        })
    }

    // threshold unit: ms
    checkAndDeleteExpiredReminders (threshold = 604800000) {
        logger.info(`Checking expried reminders.. Appleid threshold: ${threshold/86400000} days`)
        let targetReminders = []
        let dateNow = new Date(Date.now())
        this.forEach( (reminder) => {
            if (dateNow - reminder.datetime > threshold) {
                targetReminders.push(reminder)
            }
        })
        targetReminders.forEach( (reminder) => {
            this.deleteReminderById(reminder.id)
        })
    }
}