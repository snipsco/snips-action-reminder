const { logger } = require('../utils')
const { extractSlots, flowContinueBuiltin } = require('./common')
const i18nFactory = require('../factories/i18nFactory')
const {
    getReminders,
    renameReminderById
} = require('../reminders')

module.exports = async function (msg, flow, knownSlots = { depth: 3 }) {
    logger.debug('renameReminder')
    const i18n = i18nFactory.get()
    const slots = await extractSlots(msg, knownSlots)
    const reminders = getReminders(
        slots.former_reminder_name,
        slots.datetime,
        slots.recurrence
    )

    // One reminder found, new name provided
    if (reminders.length === 1 && slots.new_reminder_name) {
        logger.debug('One reminder found, new name provided')
        flow.end()
        const oldName = reminders[0].name
        renameReminderById(reminders[0].id, slots.new_reminder_name)

        return i18n('renameReminder.info.reminderRenamed', {
            oldName,
            newName: slots.new_reminder_name
        })
    }

    // Reached the max re-try times
    if (knownSlots.depth === 0) {
        logger.debug('Reached the max re-try times')
        flow.end()
        return i18n('inform.doNotUnderstantd')
    }

    // No reminders, no slots
    if (!reminders.length && !Object.keys(slots).length) {
        logger.debug('No reminders, no slots')
        flow.end()
        return i18n('getReminders.info.noReminderFound')
    }

    // No reminders found, former_reminder_name and new_reminder_name provided
    if (!reminders.length && (slots.former_reminder_name || slots.new_reminder_name)) {
        logger.debug('No reminders found, former_reminder_name and new_reminder_name provided')
        flowContinueBuiltin(flow, knownSlots, require('./index').renameReminder)
        flow.continue('snips-assistant:Yes', (msg, flow) => {
            slots.depth = 3
            return require('./index').setReminder(msg, flow, slots)
        })
        return i18n('renameReminder.info.noReminderFound') + i18n('setReminder.ask.createReminder')
    }

    // One reminder found, new name not provided
    if (reminders.length === 1 && !slots.new_reminder_name) {
        logger.debug('One reminder found, new name not provided')
        slots.depth = knownSlots.depth - 1
        flowContinueBuiltin(flow, slots, require('./index').renameReminder)
        flow.continue('snips-assistant:RenameReminder', (msg, flow) => {
            return require('./index').renameReminder(msg, flow, slots)
        })
        return i18n('renameReminder.ask.newReminderName')
    }

    // Several reminders found
    if (reminders.length > 1) {
        logger.debug('Several reminders found')
        slots.depth = knownSlots.depth - 1
        flowContinueBuiltin(flow, slots, require('./index').renameReminder)
        flow.continue('snips-assistant:RenameReminder', (msg, flow) => {
            return require('./index').renameReminder(msg, flow, slots)
        })
        return i18n('getReminders.info.foundReminders', {
            number: reminders.length,
            odd: (reminders.length === 1) ? '' : 's' 
        }) + i18n('renameReminder.ask.whichToRename')
    }

    flow.end()
    return i18n('debug.caseNotRecognized')
}