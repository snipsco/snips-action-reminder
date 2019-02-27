const { logger, arrayIntersection, generateMessageForReminders } = require('../utils')
const i18nFactory = require('../factories/i18nFactory')
const commonHandler = require('./common')
const {
    getAllComingReminders,
    deleteAllReminders,
    deleteReminderById,
    getRemindersByName,
    getRemindersByDatetime,
    getRemindersByRecurrence
} = require('../reminders')

module.exports = async function (msg, flow, knownSlots) {
    logger.debug('cancelReminder')
    const i18n = i18nFactory.get()
    const slots = await commonHandler(msg, knownSlots)

    const reminders = getAllComingReminders()

    if (!reminders.length) {
        flow.end()
        return i18n('inform.noComingReminder')
    }

    if (reminders.length && slots.all_reminders && Object.keys(slots).length == 1) {
        flow.continue('snips-assistant:Yes', (msg, flow) => {
            flow.end()
            deleteAllReminders()
            return i18n('inform.confirmAllCancelled')
        })
        flow.continue('snips-assistant:No', (msg, flow) => {
            flow.end()
        })
        return i18n('ask.confirmToCancelAll')
    }

    if (reminders.length && Object.keys(slots).length) {
        let res = null

        const remindersFromDatetime = slots.datetime ? getRemindersByDatetime(slots.datetime) : []
        const remindersFromName = slots.reminder_name ? getRemindersByName(slots.reminder_name) : []
        const remindersFromRecurrence = slots.recurrence ? getRemindersByRecurrence(slots.recurrence) : []

        logger.debug(`reminder found by name ${remindersFromName}`)
        logger.debug(`reminder found by datetime ${remindersFromDatetime}`)
        logger.debug(`reminder found by recurrence ${remindersFromRecurrence}`)

        if (remindersFromDatetime.length && remindersFromName.length && remindersFromRecurrence.length) {
            res = arrayIntersection(remindersFromDatetime, remindersFromName)
            res = arrayIntersection(remindersFromRecurrence, res)
        } else if (!remindersFromDatetime.length && remindersFromName.length && remindersFromRecurrence.length) {
            res = remindersFromName.concat(remindersFromRecurrence)
        } else if (remindersFromDatetime.length && !remindersFromName.length && remindersFromRecurrence.length) {
            res = remindersFromDatetime.concat(remindersFromRecurrence)
        } else if (remindersFromDatetime.length && remindersFromName.length && !remindersFromRecurrence.length) {
            res = remindersFromDatetime.concat(remindersFromName)
        } else {
            res = remindersFromName.concat(remindersFromDatetime).concat(remindersFromRecurrence)
        }

        logger.debug(res.length)

        if (res.length === 1) {
            flow.continue('snips-assistant:Yes', (msg, flow) => {
                flow.end()
                deleteReminderById(res[0].id)
                return i18n('inform.confirmCancelledReminder', {
                    name: res[0].name
                })
            })
            flow.continue('snips-assistant:No', (msg, flow) => {
                flow.end()
            })
            return i18n('ask.confirmToDeleteReminder', {
                name: res[0].name,
                date_time: res[0].datetime.toLocaleString('fr-FR', {
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'}),
                recurrence: res[0].recurrence
            })
        } else if (res.length > 1 && slots.all_reminders) {
            flow.continue('snips-assistant:Yes', (msg, flow) => {
                flow.end()

                let reminderIds = []

                res.forEach(reminder => {
                    logger.debug(deleteReminderById(reminder.id) ? `Success ${reminder.id}` : `Faild ${reminder.id}`)
                })

                return i18n('inform.confirmAllCancelled')
            })
            flow.continue('snips-assistant:No', (msg, flow) => {
                flow.end()
            })

            return i18n('inform.numberOfComingReminders',{
                number: res.length
            }) + i18n('ask.confirmToCancelAll')
        } else if (res.length > 1) {
            flow.end()
            return i18n('inform.multiRemindersFound')
        } else {
            logger.debug('number 0')
            flow.end()
            return i18n('inform.noReminderFound')
        }
    }

    flow.end()
    return i18n('debug.caseNotRecognized')
}