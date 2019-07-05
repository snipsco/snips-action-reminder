import { i18n } from 'snips-toolkit'
import { Reminder } from './reminder'
import { beautify } from './beautify'
import { DateRange } from './parser'

function getHead(reminders: Reminder[], name?: string, dateRange?: DateRange, recurrence?: string): string {
    function getFormat(dateRange?: DateRange): string {
        if (dateRange) {
            if (dateRange.grain) {
                if (dateRange.grain === 'Day') {
                    return 'date'
                }
                if (dateRange.grain === 'Week') {
                    return 'daterange'
                }
                return 'datetime'
            } else {
                return 'daterange'
            }
        }

        return ''
    }

    let time: string = ''
    if (dateRange) {
        switch (getFormat(dateRange)) {
            case 'datetime':
                time = beautify.datetime(dateRange.min)
                break
            case 'daterange':
                time = beautify.daterange(dateRange)
                break
            case 'date':
                time = beautify.date(dateRange.min)
                break
            default:
                time = beautify.datetime(dateRange.min)
        }
    }

    // "I found <number> reminder(s) named <name>."
    if (name && !dateRange && !recurrence) {
        return i18n.translate('getReminder.head.found', {
            number: reminders.length,
            odd: reminders.length > 1 ? 's' : '',
            name,
            context: 'name'
        })
    }

    // "I found <number> reminder(s) set for <time>."
    if (!name && dateRange && !recurrence) {
        return i18n.translate('getReminder.head.found', {
            number: reminders.length,
            odd: reminders.length > 1 ? 's' : '',
            time,
            context: 'time'
        })
    }

    // "I found <number> reminder(s) set for <recurrence>."
    if (!name && !dateRange && recurrence) {
        return i18n.translate('getReminder.head.found', {
            number: reminders.length,
            odd: reminders.length > 1 ? 's' : '',
            recurrence,
            context: 'recurrence'
        })
    }

    // "I found <number> reminder(s) named <name> and set for <time>."
    if (name && dateRange && !recurrence) {
        return i18n.translate('getReminder.head.found', {
            number: reminders.length,
            odd: reminders.length > 1 ? 's' : '',
            name,
            time,
            recurrence: 'time_name'
        })
    }

    // "I found <number> reminder(s) named <name> and set for <recurrence>."
    if (name && !dateRange && recurrence) {
        return i18n.translate('getReminder.head.found', {
            number: reminders.length,
            odd: reminders.length > 1 ? 's' : '',
            name,
            recurrence,
            context: 'recurrence_name'
        })
    }

    // "I found <number> reminder(s) set for <recurrence> at <time>."
    if (!name && dateRange && recurrence) {
        return i18n.translate('getReminder.head.found', {
            number: reminders.length,
            odd: reminders.length > 1 ? 's' : '',
            time,
            recurrence,
            context: 'time_recurrence'
        })
    }

    // "I found <number> reminder(s) named <name> and set for <recurrence> at <time>."
    if (name && dateRange && recurrence) {
        return i18n.translate('getReminder.head.found', {
            number: reminders.length,
            odd: reminders.length > 1 ? 's' : '',
            name,
            time,
            recurrence,
            context: 'time_recurrence_name'
        })
    }

    // "I found <number> reminder(s)."
    return i18n.translate('getReminder.head.found', {
        number: reminders.length,
        odd: reminders.length > 1 ? 's' : ''
    })
}

// "<name> set for <time>."
function getList(reminders: Reminder[], dateRange?: DateRange): string {
    let tts: string = ''

    const beautifyFct = (dateRange && dateRange.grain === 'Day') ? beautify.time : beautify.datetime

    if (reminders.length === 1) {
        const reminder = reminders[0]

        if (reminder.name && reminder.recurrence) {
            return i18n.translate('getReminder.list.singleReminder', {
                name: reminder.name,
                recurrence: beautify.recurrence(reminder.date, reminder.recurrence),
                context: 'recurrence_name'
            })
        } else if (reminder.name && !reminder.recurrence) {
            return i18n.translate('getReminder.list.singleReminder', {
                name: reminder.name,
                time: beautifyFct(reminder.date),
                context: 'name'
            })
        } else if (!reminder.name && reminder.recurrence) {
            return i18n.translate('getReminder.list.singleReminder', {
                recurrence: beautify.recurrence(reminder.date, reminder.recurrence),
                context: 'recurrence'
            })
        }

        return i18n.translate('getReminder.list.singleReminder', {
            time: beautifyFct(reminder.date),
            context: 'time'
        })
    } else {
        for (let i = 0; i < reminders.length; i++) {
            const reminder = reminders[i]

            if (reminder.name && reminder.recurrence) {
                tts += i18n.translate('getReminder.list.scheduled', {
                    name: reminder.name,
                    recurrence: beautify.recurrence(reminder.date, reminder.recurrence),
                    context: 'recurrence_name'
                })
            } else if (reminder.name && !reminder.recurrence) {
                tts += i18n.translate('getReminder.list.scheduled', {
                    name: reminder.name,
                    time: beautifyFct(reminder.date),
                    context: 'name'
                })
            } else if (!reminder.name && reminder.recurrence) {
                tts += i18n.translate('getReminder.list.scheduled', {
                    recurrence: beautify.recurrence(reminder.date, reminder.recurrence),
                    context: 'recurrence'
                })
            } else {
                tts += i18n.translate('getReminder.list.scheduled', {
                    time: beautifyFct(reminder.date)
                })
            }

            tts += ' '
        }
    }

    return tts
}

export const translation = {
    getRemindersToSpeech(reminders: Reminder[], name?: string, dateRange?: DateRange, recurrence?: string): string {
        let tts: string = ''

        tts += getHead(reminders, name, dateRange, recurrence)

        if (reminders.length > 0) {
            tts += ' '
            tts += getList(reminders, dateRange)
        }

        return tts
    },

    setReminderToSpeech(reminder: Reminder): string {
        if (reminder.name && !reminder.recurrence) {
            return i18n.translate('setReminder.info.scheduled', {
                name: reminder.name,
                time: beautify.datetime(reminder.date),
                context: 'name'
            })
        }

        if (!reminder.name && reminder.recurrence) {
            return i18n.translate('setReminder.info.scheduled', {
                recurrence: beautify.recurrence(reminder.date, reminder.recurrence),
                context: 'recurrence'
            })
        }

        if (reminder.name && reminder.recurrence) {
            return i18n.translate('setReminder.info.scheduled', {
                name: reminder.name,
                recurrence: beautify.recurrence(reminder.date, reminder.recurrence),
                context: 'name_recurrence'
            })
        }

        return i18n.translate('setReminder.info.scheduled', {
            time: beautify.datetime(reminder.date)
        })
    }
}
