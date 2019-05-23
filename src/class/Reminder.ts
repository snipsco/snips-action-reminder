import fs from 'fs'
import path from 'path'
import timestamp from 'time-stamp'
import cron, { ScheduledTask } from 'node-cron'
import { getScheduleString } from '../utils'
import { logger, i18n } from 'snips-toolkit'
import { Hermes } from 'hermes-javascript'
import { InstantTimeSlotValue, slotType, Enums } from 'hermes-javascript/types'
import { parseExpression } from 'cron-parser'
import { ALARM_CRON_EXP, DIR_DB, MAX_REPEAT } from '../constants'

export type ReminderInit = {
    name: string
    datetime?: Date
    recurrence?: string
}

export type ReminderString = {
    id: string
    name: string
    schedule: string
    rawDatetime: string
    rawRecurrence?: string
    nextExecution?: string
    isExpired: boolean
}

/**
 * Reminder
 *
 * @exception {pastReminderDatetime}
 * @exception {noTaskReminderAlarmFound}
 */
export class Reminder {
    id: string = ''
    name: string = ''
    schedule: string = ''
    isExpired: boolean = false

    rawDatetime: Date = new Date()
    rawRecurrence: string | null = null
    nextExecution: Date | null = null

    taskReminder: ScheduledTask | null = null
    taskReminderAlarm: ScheduledTask | null = null

    // Used to count, only repeat for MAX_REPEAT times
    repeat: number = 0

    constructor(obj: ReminderInit | string, hermes: Hermes) {
        if (typeof obj === 'string') {
            this.constructorLoad(obj, hermes)
        } else if (typeof obj === 'object') {
            this.constructorCreate(obj, hermes)
        }
    }

    private constructorLoad(rawString: string, hermes: Hermes) {
        const loadData: ReminderString = JSON.parse(rawString)

        this.id = loadData.id
        this.name = loadData.name

        this.rawDatetime = new Date(loadData.rawDatetime)
        this.rawRecurrence = loadData.rawRecurrence || null

        this.schedule = loadData.schedule
        this.isExpired = loadData.isExpired

        //this.nextExecution = new Date(parseExpression(this.schedule).next().toString())
        this.nextExecution = loadData.nextExecution
            ? new Date(loadData.nextExecution)
            : null

        if (this.isExpired) {
            return
        }

        if (!this.nextExecution) {
            return
        }

        if (!this.rawRecurrence && this.nextExecution.getTime() < Date.now()) {
            this.setExpired()
            this.save()
            return
        } else if (
            this.rawRecurrence &&
            this.nextExecution.getTime() < Date.now()
        ) {
            this.nextExecution = new Date(
                parseExpression(this.schedule)
                    .next()
                    .toString()
            )
            this.make_alive(hermes)
        }
    }

    private constructorCreate(initData: ReminderInit, hermes: Hermes) {
        this.id = timestamp('YYYYMMDD-HHmmss-ms')
        this.name = initData.name

        this.rawDatetime = initData.datetime || new Date()
        this.rawRecurrence = initData.recurrence || null

        this.schedule = getScheduleString(this.rawDatetime, this.rawRecurrence)
        this.isExpired = false

        this.nextExecution = new Date(
            parseExpression(this.schedule)
                .next()
                .toString()
        )

        if (this.nextExecution.getTime() < Date.now() + 15000) {
            throw new Error('pastReminderDatetime')
        }

        this.make_alive(hermes)
        this.save()
    }

    /**
     * Create and start cron task
     *
     * @param hermes
     */
    private make_alive(hermes: Hermes) {
        const dialogId: string = `snips-assistant:reminder:${this.id}`

        const onReminderArrive = () => {
            // Check if its repeating time reach the limite
            if (this.repeat < MAX_REPEAT) {
                this.repeat += 1
            } else {
                this.reset()
                return
            }

            // Get reminding message
            const message = i18n.randomTranslation('alarm.info.itsTimeTo', {
                name: this.name
            })

            // Subscribe to the reminding session
            hermes.dialog().sessionFlow(dialogId, (_, flow) => {
                flow.continue('snips-assistant:Cancel', (_, flow) => {
                    this.reset()
                    flow.end()
                })
                flow.continue('snips-assistant:StopSilence', (_, flow) => {
                    this.reset()
                    flow.end()
                })
            })

            // Start a reminding session which play sound and tts
            hermes.dialog().publish('start_session', {
                init: {
                    type: Enums.initType.action,
                    text: '[[sound:ding.ding]] ' + message,
                    intentFilter: [
                        'snips-assistant:Cancel',
                        'snips-assistant:StopSilence'
                    ],
                    canBeEnqueued: true,
                    sendIntentNotRecognized: true
                },
                customData: dialogId,
                siteId: 'default'
            })
        }

        this.taskReminderAlarm = cron.schedule(
            ALARM_CRON_EXP,
            onReminderArrive,
            { scheduled: false }
        )
        this.taskReminder = cron.schedule(this.schedule, () => {
            if (this.taskReminderAlarm) {
                this.taskReminderAlarm.start()
            } else {
                throw new Error('noTaskReminderAlarmFound')
            }
        })
    }

    /**
     * Elicit reminder info to string
     */
    toString() {
        return JSON.stringify({
            id: this.id,
            name: this.name,
            schedule: this.schedule,
            rawDatetime: this.rawDatetime.toJSON(),
            rawRecurrence: this.rawRecurrence,
            nextExecution: this.nextExecution,
            isExpired: this.isExpired
        })
    }

    /**
     * Save reminder info to fs
     */
    save() {
        fs.writeFile(
            path.resolve(__dirname + DIR_DB, `${this.id}.json`),
            this.toString(),
            'utf8',
            err => {
                if (err) {
                    throw new Error(err.message)
                }
                logger.info(`Saved reminder: ${this.name} - ${this.id}`)
            }
        )
    }

    /**
     * Remove the saved copy from fs
     */
    delete() {
        this.destory()

        fs.unlink(path.resolve(__dirname + DIR_DB, `${this.id}.json`), err => {
            if (err) {
                throw new Error(err.message)
            }
            logger.info(`Deleted reminder: ${this.name} - ${this.id}`)
        })
    }

    /**
     * Distory all the task cron, release memory
     */
    destory() {
        if (this.taskReminder) {
            this.taskReminder.stop()
            this.taskReminder.destroy()
        }

        if (this.taskReminderAlarm) {
            this.taskReminderAlarm.stop()
            this.taskReminderAlarm.destroy()
        }
    }

    /**
     * Reset alarm, update nextExecution
     */
    reset() {
        if (this.taskReminderAlarm) {
            this.taskReminderAlarm.stop()
        } else {
            throw new Error('noTaskReminderAlarmFound')
        }

        if (!this.rawRecurrence) {
            this.setExpired()
            this.save()
        } else {
            this.nextExecution = new Date(
                parseExpression(this.schedule)
                    .next()
                    .toString()
            )
        }
    }

    /**
     * Deactivate reminder, keep the copy saved
     */
    setExpired() {
        if (this.taskReminder) {
            this.taskReminder.stop()
            this.taskReminder.destroy()
            this.taskReminder = null
        }

        if (this.taskReminderAlarm) {
            this.taskReminderAlarm.stop()
            this.taskReminderAlarm.destroy()
            this.taskReminderAlarm = null
        }

        this.isExpired = true
    }

    reschedule(
        newDatetimeSnips?: InstantTimeSlotValue<slotType.instantTime>,
        newRecurrence?: string
    ) {
        if (!newDatetimeSnips && !newRecurrence) {
            throw new Error('noRescheduleTimeFound')
        }
        // reserved
    }
}
