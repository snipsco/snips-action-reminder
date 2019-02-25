const path = require('path')
const cron = require('node-cron')
const timestamp = require('time-stamp')
const fs = require('fs')
const parser = require('./utils/parser')
const i18nFactory = require('./factories/i18nFactory')
const logger = require('./utils/logger')
const { ask } = require('./tts')

const reminders = []
const remindersDir = __dirname + '/../reminder_records/'

function initReminder(name, datetime, recurrence, id = null, schedule = null, expired = null) {
    if (!name || !(datetime || recurrence)){
        throw 'incompleteReminderCreationInfo'
    }

    let _datetime = new Date((datetime) ? datetime : Date.now())
    let _schedule = (schedule) ? schedule : parser.getScheduleString(_datetime, recurrence)

    return {
        id: (id) ? id : timestamp('YYYYMMDD-HHmmss-ms'),
        name,
        datetime: _datetime,
        recurrence,
        schedule: _schedule,
        expired: (expired) ? expired : false,
        taskAlarm: cron.schedule('*/15 * * * * *', () => {
            const i18n = i18nFactory.get()
            let message = i18n('info.remind', {
                name: this.name
            })
            //alarm()
            // customData only supports string type
            ask(message, JSON.stringify({
                reminder_id: this.id,
                reminder_name: this.name}))
        }, {
            scheduled: false
        }),
        taskReminder: cron.schedule(_schedule, () => {
            this.statusAlarm = true
            this.taskAlarm.start()
        }, {
            scheduled: false
        }),
        disableAlarm() {
            this.statusAlarm = false
            this.taskAlarm.stop()
            logger.info(`Reminder: ${this.id}'s alarm is disabled`)
            if (!this.recurrence) {
                this.expired = true
                this.taskAlarm.destory()
                logger.info(`Reminder: ${this.id} is expired`)
            }
        },
        save() {
            let data = JSON.stringify({
                id: this.id,
                name: this.name,
                datetime: this.datetimeStr,
                recurrence: this.recurrence,
                schedule: this.schedule,
                expired: this.expired
            })

            fs.writeFile(path.resolve(remindersDir, `${this.id}.json`), data, 'utf8', (err) => {
                if (err) {
                    throw new Error(err)
                }
                logger.info(`Saved reminder: ${this.id}.json`)
            })
        },
        delete() {
            this.taskReminder.stop()
            this.taskReminder.destroy()
            this.taskAlarm.stop()
            this.taskAlarm.destory()

            fs.unlink(path.resolve(remindersDir, `${this.id}.json`), (err) => {
                if (err) {
                    throw new Error(err)
                }
                logger.info(`Deleted reminder: ${this.id}`)
            })
        }
    }
}

function createReminder(name, datetime, recurrence, id = null, schedule = null, expired = null) {
    const reminder = initReminder(name, datetime, recurrence, id, schedule, expired)
    if (reminder) {
        reminders.push(reminder)
        reminder.taskReminder.start()
        reminder.save()
        return reminder
    } else {
        return null
    }
}
// get reminders by different time constrain
function getReminderByMinute(datetime) {

}

function getRemindersByHour(datetime) {

}

function getRemindersByDay(datetime) {

}

function getRemindersByWeek(datetime) {

}

function getRemindersByMonth(datetime) {

}

module.exports = {
    createReminder,
    getAllReminders() {
        return [...reminders]
    },
    getExpiredReminders() {
        // reminders in the past 7 days
        return reminders.filter(reminder => reminder.expired)
    },
    getReminderById(id) {
        return reminders.filter(reminder => reminder.id === id)
    },
    getRemindersByName(name) {
        return reminders.filter(reminder => reminder.name === name)
    },
    getRemindersByDatetime(datetime) {
        switch (datetime.grain) {
            case 'Minute':
                return getReminderByMinute(datetime.value)
            case 'Hour':
                return getRemindersByHour(datetime.value)
            case 'Day':
                return getRemindersByDay(datetime.value)
            case 'Week':
                return getRemindersByWeek(datetime.value)
            case 'Month':
                return getRemindersByMonth(datetime.value)
            default:
                return null
        }
    },
    getRemindersByRecurrence(recurrence) {
        return reminders.filter(reminder => reminder.recurrence === recurrence)
    },
    deleteReminderById(id) {
        const reminder = reminders.filter(reminder => reminder.id === id)
        if(reminder) {
            // place holder -- destory cron jobs (reminder and alarm)

            reminders.splice(reminders.indexOf(reminder), 1)
            return true
        }
        return false
    },
    loadAllReminders() {
        fs.readdir(path.resolve(remindersDir), (err, files) => {
            if(err){
                throw new Error(err)
            }
            logger.info(`Found ${files.length} saved reminders!`)

            // load each saved reminder to runtime system
            files.forEach(file => {
                let reminderPath = path.resolve(remindersDir, `${file}`)
                logger.debug(`Reading: ${reminderPath}`)
                // try to read in async way
                let reminderTemp = JSON.parse(fs.readFileSync(reminderPath))
                let res = createReminder(reminderTemp.name,
                                         reminderTemp.datetime,
                                         reminderTemp.recurrence,
                                         reminderTemp.id,
                                         reminderTemp.schedule,
                                         reminderTemp.expired)
                if (res) {
                    logger.info(`Loaded reminder: ${res.id}`)
                } else {
                    logger.error(`Loaded reminder: ${res.id} faild!`)
                }
            })
        })
    },
    enableAllReminders() {
        reminders.forEach(reminder => {
            reminder.taskReminder.start()
        })
    },
    disableAllReminders() {
        reminders.forEach(reminder => {
            reminder.taskReminder.stop()
            reminder.taskAlarm.stop()
        })
    }
}