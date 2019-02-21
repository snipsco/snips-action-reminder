const fs = require('fs')
const path = require('path')
const { logger } = require('../utils')
const { Reminder } = require('../class')
const { i18nFactory } = require('../factories')

module.exports = class ReminderArray extends Set {
    constructor (remindersPath) {
        super()
        this.remindersPath = remindersPath
    }

    addReminder (reminder_name, datetime, recurrence, id = null) {
        const i18n = i18nFactory.get()
        let res = null

        try {
            let temp = new Reminder(reminder_name, datetime, recurrence, id)

            logger.info((id?'Load':'New') + `reminder: ${reminderPool.length}`)

            logger.debug(temp.dumpReminderInfo())

            let datetimeString = temp.datetime.toLocaleString('fr-FR', {
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric' })

            res = i18n('info.confirmReminderSet', {
                name: temp.name,
                date_time: datetimeString,
                recurrence: temp.recurrence
            })

            temp.enable()
            this.add(temp)
        } catch (err) {
            logger.error(err)
            res = i18n('error.incomplete')
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
            files.forEach(file => {
                let reminderPath = path.resolve(`${this.remindersPath}${file}`)
                fs.readFile(reminderPath, 'utf8', function (err, data) {
                    if (err) {
                        logger.error(err)
                    }
                    let reminderTemp = JSON.parse(data)
                    let res = this.addReminder(reminderTemp.name,
                                               reminderTemp.datetime,
                                               reminderTemp.recurrence,
                                               reminderTemp.id)
                    logger.info(res)
                })
            })
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

}