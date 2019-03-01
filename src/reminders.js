const path = require('path')
const cron = require('node-cron')
const timestamp = require('time-stamp')
const fs = require('fs')
const { getCompletedDatetime, getScheduleString } = require('./utils/parser')
const matchDatetime = require('./utils/matchDatetime')
const logger = require('./utils/logger')
const { createAlarm } = require('./alarms')

const reminders = []
const remindersDir = __dirname + '/../reminder_records/'

function initReminder(name, datetime, recurrence, id = null, schedule = null, expired = null) {
    if (!name || !(datetime || recurrence)){
        throw 'incompleteReminderCreationInfo'
    }

    const _id = (id) ? id : timestamp('YYYYMMDD-HHmmss-ms')
    const _datetime = (id) ? (new Date(datetime)) : (new Date((datetime) ? getCompletedDatetime(datetime) : Date.now()))
    const _schedule = (schedule) ? schedule : getScheduleString(_datetime, recurrence)

    const taskReminder = cron.schedule(_schedule, () => {
        createAlarm(name, _id)
    }, {
        scheduled: false
    })

    return {
        id: _id,
        name,
        datetime: _datetime,
        recurrence,
        schedule: _schedule,
        taskReminder,
        expired: (expired) ? expired : false,
        save() {
            let data = JSON.stringify({
                id: this.id,
                name: this.name,
                datetime: this.datetime.toJSON(),
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
        if (!id) {
            reminder.save()
        }
        return reminder
    } else {
        return null
    }
}

function getReminderById(id) {
    const reminder = reminders.filter(reminder => reminder.id === id)
    if (reminder.length === 1) {
        return reminder[0]
    }
    return null
}

function checkExpiredById(id) {
    const reminder = getReminderById(id)
    if (reminder) {
        let datetimeNow = new Date(Date.now())
        if (datetimeNow > reminder.datetime && !reminder.recurrence && !reminder.expired) {
            reminder.expired = true
            reminder.save()
            logger.debug(`Set reminder: ${reminder.id} to expired`)
        }
    } else {
        throw `canNotFindReminder: ${id}`
    }
}

function getAllComingReminders() {
    return reminders.filter(reminder => !reminder.expired)
}

function getAllExpiredReminders() {
    // reminders in the past 7 days
    return reminders.filter(reminder => reminder.expired)
}

module.exports = {
    createReminder,
    renameReminderById(id, newName) {
        const reminder = getReminderById(id)
        const index = reminders.indexOf(reminder)
        reminders[index].name = newName
        reminders[index].taskReminder.stop()
        reminders[index].taskReminder.destroy()
        reminders[index].taskReminder = cron.schedule(reminders[index].schedule, () => {
            createAlarm(newName, reminders[index].id)
        })
        reminders[index].save()
    },
    rescheduleReminderById(id, newDatetime) {
        const reminder = getReminderById(id)
        const index = reminders.indexOf(reminder)
        reminders[index].datetime = getCompletedDatetime(newDatetime)
        reminders[index].schedule = getScheduleString(reminders[index].datetime, reminders[index].recurrence)
        reminders[index].taskReminder.stop()
        reminders[index].taskReminder.destroy()
        reminders[index].taskReminder = cron.schedule(reminders[index].schedule, () => {
            createAlarm(reminders[index].name, reminders[index].id)
        })
        reminders[index].save()
    },
    getAllReminders() {
        return [...reminders]
    },
    getAllComingReminders,
    getAllExpiredReminders,
    getReminders(name, datetime, recurrence, expired = false) {
        return reminders.filter(reminder =>
            (!name || name === reminder.name) &&
            (!datetime || matchDatetime(datetime, reminder.datetime)) &&
            (!recurrence || recurrence === reminder.recurrence) &&
            (expired === reminder.expired)
        )
    },
    getReminderById,
    getRemindersByName(name) {
        return reminders.filter(reminder => reminder.name === name)
    },
    getRemindersByDatetime(datetime) {
        return reminders.filter(reminder => matchDatetime(datetime, reminder.datetime))
    },
    getRemindersByRecurrence(recurrence) {
        return reminders.filter(reminder => reminder.recurrence === recurrence)
    },
    checkExpiredById,
    deleteAllReminders() {
        reminders.forEach(reminder => {
            reminder.delete()
        })
        reminders.splice(0)
    },
    deleteReminderById(id) {
        const reminder = reminders.filter(reminder => reminder.id === id)
        if(reminder.length === 1) {
            reminder[0].delete()
            reminders.splice(reminders.indexOf(reminder[0]), 1)
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
                    checkExpiredById(res.id)
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
        })
    },
    destroyAllReminders() {
        reminders.forEach(reminder => {
            reminder.taskReminder.stop()
            reminder.taskReminder.destroy()
        })
    }
}