export const DEFAULT_LOCALE = 'english'
export const SUPPORTED_LOCALES = [ 'english', 'french' ]
export const DEFAULT_LANGUAGE = 'en'
export const LANGUAGE_MAPPINGS = {
    english: 'en',
    french: 'fr'
}
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
export const CONFIDENCE_DEFAULT = {
    INTENT_STANDARD: 0.5,
    INTENT_DROP: 0.3,
    SLOT_DROP: 0.5,
    ASR: 0.2
}
export const ALARM_CRON_EXP = '*/15 * * * * *'
export const DIR_DB = '/../../.db'

export const MAX_REPEAT = 3