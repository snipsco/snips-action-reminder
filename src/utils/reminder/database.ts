import { Reminder, SerializedReminder } from './reminder'
import { DateRange } from '..'
import { logger } from 'snips-toolkit'
import fs from 'fs'
import path from 'path'
import { Hermes } from 'hermes-javascript'
import { DB_DIR } from '../../constants'

function isDateInRange(date: Date, dateRange: DateRange) {
    return date >= dateRange.min && date < dateRange.max
}

export class Database {
    reminders: Reminder[] = []
    hermes: Hermes

    constructor(hermes: Hermes) {
        this.hermes = hermes
        this.loadSavedReminders()
    }

    /**
     * Load from file system
     */
    loadSavedReminders() {
        const savedIds: string[] = fs.readdirSync(path.resolve(DB_DIR))
        logger.info(`Found ${savedIds.length} saved reminders!`)

        try {
            savedIds.forEach(id => {
                const pathAbs = path.resolve(DB_DIR, id)
                logger.debug('Reading: ', pathAbs)

                const data: SerializedReminder = JSON.parse(fs.readFileSync(pathAbs).toString())

                const now = new Date()
                const date = new Date(data.date)

                if (now < date || data.recurrence) {
                    this.add(date, data.recurrence || undefined, data.name, data.id)
                } else {
                    fs.unlink(path.resolve(DB_DIR, `${ data.id }.json`), (err) => {
                        if (err) {
                            throw new Error(err.message)
                        }
                        logger.info(`Deleted alarm: ${ data.id }`)
                    })
                }
            })
        } catch (err) {
            logger.error(err)
        }
    }

    add(date: Date, recurrence?: string, name?: string, id?: string): Reminder {
        const reminder = new Reminder(this.hermes, date, recurrence, name, id)
        reminder.save()
        this.reminders.push(reminder)

        reminder.on('shouldBeDeleted', alarm => {
            this.deleteById(alarm.id)
        })

        return reminder
    }

    /**
     * Get reminders
     *
     * @param name
     * @param range
     * @param recurrence
     */
    get(name?: string, range?: DateRange, recurrence?: string) {
        return this.reminders.filter(alarm =>
            (!name || alarm.name === name) &&
            (!range || isDateInRange(alarm.date, range)) &&
            (!recurrence || alarm.recurrence === recurrence)
        ).sort((a, b) => {
            return (a.date.getTime() - b.date.getTime())
        })
    }

    /**
     * Get a reminder by its id
     *
     * @param id
     */
    getById(id: string): Reminder {
        const res = this.reminders.filter(reminder => reminder.id === id)
        if (res.length === 0) {
            throw new Error('canNotFindReminder')
        }
        return res[0]
    }

    /**
     * Delete an exist reminder from database
     *
     * @param id
     */
    deleteById(id: string): boolean {
        const reminder = this.getById(id)
        if (reminder) {
            reminder.delete()
            this.reminders.splice(this.reminders.indexOf(reminder), 1)
            return true
        }

        return false
    }

    /**
     * Delete all reminders
     */
    deleteAll() {
        this.reminders.forEach(reminder => {
            reminder.delete()
        })
        this.reminders.splice(0)
    }

    /**
     * Disable all the reminders and release memory
     */
    destroy() {
        // disable all the reminders (task crons)
        this.reminders.forEach(reminder => {
            reminder.destroy()
        })
    }
}
