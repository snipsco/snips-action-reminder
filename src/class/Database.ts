import { Reminder, ReminderInit } from './Reminder'
import { DIR_DB } from '../constants'
import { DatetimeRange } from '../utils'
import { logger } from 'snips-toolkit'
import fs from 'fs'
import path from 'path'
import { Hermes } from 'hermes-javascript'

export type GetReminderObj = {
    name?: string
    datetimeRange?: DatetimeRange
    recurrence?: string
    isExpired?: boolean
}

function isDateInRange(datetimeRange: DatetimeRange, datetimeObj: Date) {
    return datetimeObj.getTime() >= datetimeRange.min &&
        datetimeObj.getTime() < datetimeRange.max
        ? true
        : false
}

export class Database {
    // Save all the reminders
    __reminders: Reminder[] = []

    // Save the hermes client
    __hermesClient: Hermes

    constructor(hermes: Hermes) {
        this.__hermesClient = hermes
        this.loadSavedReminders()
    }

    /**
     * Load from file system
     */
    loadSavedReminders() {
        const savedIds: string[] = fs.readdirSync(
            path.resolve(__dirname + DIR_DB)
        )
        logger.info(`Found ${savedIds.length} saved reminders!`)

        savedIds.forEach(id => {
            const pathAbs = path.resolve(__dirname + DIR_DB, id)
            logger.debug('Reading: ', pathAbs)

            const reminderRawString = fs.readFileSync(pathAbs).toString()

            const reminder = new Reminder(
                reminderRawString,
                this.__hermesClient
            )
            this.__reminders.push(reminder)
        })
        this.deleteAllExpired()
    }

    add(reminderInitObj: ReminderInit): Reminder {
        const reminder = new Reminder(reminderInitObj, this.__hermesClient)
        this.__reminders.push(reminder)
        return reminder
    }

    /**
     * Get reminders
     *
     * @param obj
     */
    get(obj: GetReminderObj) {
        return this.__reminders
            .filter(
                reminder =>
                    (!obj.name || obj.name === reminder.name) &&
                    (!obj.datetimeRange ||
                        isDateInRange(
                            obj.datetimeRange,
                            reminder.rawDatetime
                        )) &&
                    (!obj.recurrence ||
                        obj.recurrence === reminder.rawRecurrence)
            )
            .sort((a, b) => {
                return a.rawDatetime.getTime() - b.rawDatetime.getTime()
            })
    }

    /**
     * Get a reminder by its id
     *
     * @param id
     */
    getById(id: string): Reminder {
        const res = this.__reminders.filter(reminder => reminder.id === id)
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
    deleteById(id: string) {
        const reminder = this.getById(id)
        if (reminder) {
            reminder.delete()
            this.__reminders.splice(this.__reminders.indexOf(reminder), 1)
            return true
        } else {
            return false
        }
    }

    /**
     * Delete all reminders
     */
    deleteAll() {
        this.__reminders.forEach(reminder => {
            reminder.delete()
        })
        this.__reminders.splice(0)
    }

    /**
     * Delete all the expired reminders
     */
    deleteAllExpired() {
        this.__reminders.forEach(reminder => {
            if (reminder.isExpired) {
                reminder.delete()
                this.__reminders.splice(this.__reminders.indexOf(reminder), 1)
            }
        })
    }

    /**
     * Disable all the reminders and release memory
     */
    destory() {
        // disable all the reminder (task crons)
        this.__reminders.forEach(reminder => {
            reminder.destory()
        })
    }
}
