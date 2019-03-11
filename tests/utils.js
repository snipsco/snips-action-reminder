function pad(number) {
    if ( number < 10 ) {
        return '0' + number;
    }
    return number;
}

module.exports = {
    getTestDatetime() {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
        return {
            snips: tomorrow.getUTCFullYear() +
                '-' + pad( tomorrow.getUTCMonth() + 1 ) +
                '-' + pad( tomorrow.getUTCDate() ) +
                ' ' + pad( tomorrow.getUTCHours() ) +
                ':' + pad( tomorrow.getUTCMinutes() ) +
                ':' + pad( tomorrow.getUTCSeconds() ) +
                ' +' + pad( -1 * tomorrow.getTimezoneOffset()/60 - 1) +
                ':00',
            js: tomorrow,
        }
    },
    createReminderNameSlot(reminderName) {
        return {
            slotName: 'reminder_name',
            entity: 'reminder_custom',
            confidenceScore: 1,
            rawValue: reminderName,
            value: {
                kind: 'Custom',
                value: reminderName
            },
            range: {
                start: 0,
                end: 1
            }
        }
    },
    createDatetimeSlot(datetime) {
        return {
            slotName: 'datetime',
            entity: 'snips/datetime',
            confidenceScore: 1,
            rawValue: "at ",
            value: {
                kind: 'InstantTime',
                value: datetime,
                grain: 'Hour',
                precision: 'Exact'
            },
            range: {
                start: 0,
                end: 1
            }
        }
    },
    createRecurrenceSlot(recurrence) {
        return {
            slotName: 'recurrence',
            entity: 'reminder_custom',
            confidenceScore: 1,
            rawValue: recurrence,
            value: {
                kind: 'Custom',
                value: recurrence
            },
            range: {
                start: 0,
                end: 1
            }
        }
    },
    createPastRemindersSlot(pastReminders) {
        return {
            slotName: 'past_reminders',
            entity: 'reminder_custom',
            confidenceScore: 1,
            rawValue: pastReminders,
            value: {
                kind: 'Custom',
                value: pastReminders
            },
            range: {
                start: 0,
                end: 1
            }
        }
    },
    createAllRemindersSlot(allReminders) {
        return {
            slotName: 'all_reminders',
            entity: 'reminder_custom',
            confidenceScore: 1,
            rawValue: allReminders,
            value: {
                kind: 'Custom',
                value: allReminders
            },
            range: {
                start: 0,
                end: 1
            }
        }
    }
}