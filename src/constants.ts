export const ASSETS_DIR = `${process.cwd()}/assets`
export const DB_DIR = `${process.cwd()}/.db`
export const INTENT_PREFIX_DEFAULT = 'snips-assistant:'
export const INTENTS_MAIN = [
    'SetReminder',
    'GetReminder',
    'CancelReminder',
    'RenameReminder',
    'RescheduleReminder'
]
export const INTENT_ELICITATION = {
    name: 'ElicitReminderName',
    time: 'ElicitReminderTime'
}
export const SLOTS_CUSTOM = [
    'reminder_name',
    'new_reminder_name',
    'all_reminders',
    'past_reminders',
    'recurrence'
]
export const SLOTS_TIME = [
    'datetime',
    'new_datetime'
]
export const INTENT_PROBABILITY_THRESHOLD = 0.5
export const INTENT_FILTER_PROBABILITY_THRESHOLD = 0.5
export const SLOT_CONFIDENCE_THRESHOLD = 0.5
export const ASR_UTTERANCE_CONFIDENCE_THRESHOLD = 0.5
export const ALARM_CRON_EXP = '*/15 * * * * *'
<<<<<<< HEAD
export const DIR_DB = '/../../.db'

=======
>>>>>>> fix
export const MAX_REPEAT = 3