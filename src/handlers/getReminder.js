const { logger, arrayIntersection } = require('../utils')
const i18nFactory = require('../factories/i18nFactory')
const commonHandler = require('./common')
const {
    getAllComingReminders,
    getAllExpiredReminders,
    getRemindersByDatetime,
    getRemindersByName,
    getRemindersByRecurrence
} = require('../reminders')

function generateMessageForReminders(reminders, pastRemidners = false) {
    const i18n = i18nFactory.get()

    let message = i18n(pastRemidners ? 'inform.numberOfPastReminders' : 'inform.numberOfComingReminders', {
        number: reminders.length
    })

    reminders.forEach(reminder => {
        message += i18n('inform.reminderSetFor', {
            reminder_name: reminder.name,
            date_time: reminder.datetime.toLocaleString('fr-FR', {
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'}),
            recurrence: reminder.recurrence
        })
        message += ' '
    })
    return message
}

module.exports = async function (msg, flow, knownSlots) {
    logger.debug('getReminder')
    const i18n = i18nFactory.get()
    const slots = await commonHandler(msg, knownSlots)

    const reminders = (slots.past_reminders) ? getAllExpiredReminders() : getAllComingReminders()

    // there is no reminders, slots not provided
    if (!(reminders.length || slots.datetime || slots.reminder_name || slots.recurrence)) {
        flow.end()
        return i18n(slots.past_reminders ? 'inform.noPastReminder' : 'inform.noComingReminder')
    }

    // there is no reminders, slots provided, continue to ask if user need to create
    if (!reminders.length && !slots.past_reminders && Object.keys(slots).length) {
        flow.continue('snips-assistant:Yes', (msg, flow) => {
            return require('./index').setReminder(msg, flow)
        })
        flow.continue('snips-assistant:No', (msg, flow) => {
            flow.end()
        })
        return i18n('inform.noComingReminder')+' '+i18n('ask.create')
    }

    // there are reminders, no slots provided
    if (reminders.length && !Object.keys(slots).length) {
        flow.end()
        return generateMessageForReminders(reminders, slots.past_reminders ? true : false)
    }

    // there are reminders, only past_reminders slots provided
    if (reminders.length && Object.keys(slots).length === 1 && slots.past_reminders) {
        flow.end()
        return generateMessageForReminders(reminders, true)
    }

    // there are reminders, past_reminders slots provided, other slots provided
    if (reminders.length && Object.keys(slots).length > 1 && slots.past_reminders) {
        flow.end()

        let res = null

        const remindersFromDatetime = slots.datetime ? getRemindersByDatetime(slots.datetime) : []
        const remindersFromName = slots.reminder_name ? getRemindersByName(slots.reminder_name) : []

        // recurrence remonder will never be past, always non-expired
        //const remindersFromRecurrence = slots.recurrence ? getRemindersByRecurrence(slots.recurrence) : []

        if (remindersFromDatetime.length && remindersFromName.lenght) {
            res = arrayIntersection(remindersFromDatetime, remindersFromName)
        } else {
            res = remindersFromDatetime.concat(remindersFromName)
        }

        return res.length ? generateMessageForReminders(res, true) : i18n('inform.noReminderFound')
    }

    //there are reminders, past_reminders slots not provided, other slots provided
    if (reminders.length && Object.keys(slots).length && !slots.past_reminders) {
        flow.end()

        let res = null

        const remindersFromDatetime = slots.datetime ? getRemindersByDatetime(slots.datetime) : []
        const remindersFromName = slots.reminder_name ? getRemindersByName(slots.reminder_name) : []
        const remindersFromRecurrence = slots.recurrence ? getRemindersByRecurrence(slots.recurrence) : []

        logger.debug(`reminder found by name ${remindersFromName}`)
        logger.debug(`reminder found by datetime ${remindersFromDatetime}`)
        logger.debug(`reminder found by recurrence ${remindersFromRecurrence}`)

        if (remindersFromDatetime.length && remindersFromName.lenght && remindersFromRecurrence.length) {
            res = arrayIntersection(remindersFromDatetime, remindersFromName)
            res = arrayIntersection(remindersFromRecurrence, res)
        } else if (!remindersFromDatetime.length && remindersFromName.lenght && remindersFromRecurrence.length) {
            res = remindersFromName.concat(remindersFromRecurrence)
        } else if (remindersFromDatetime.length && !remindersFromName.lenght && remindersFromRecurrence.length) {
            res = remindersFromDatetime.concat(remindersFromRecurrence)
        } else if (remindersFromDatetime.length && remindersFromName.lenght && !remindersFromRecurrence.length) {
            res = remindersFromDatetime.concat(remindersFromName)
        } else {
            res = remindersFromName.concat(remindersFromDatetime).concat(remindersFromRecurrence)
        }

        return res.length ? generateMessageForReminders(res) : i18n('inform.noReminderFound')
    }

    flow.end()
    return i18n('debug.caseNotRecognized')
}