import fs from 'fs'
import path from 'path'
import timestamp from 'time-stamp'
import cron, { ScheduledTask } from 'node-cron'
import { getScheduleString } from '..'
import { logger, i18n, config } from 'snips-toolkit'
import { Hermes } from 'hermes-javascript'
import { Enums } from 'hermes-javascript/types'
import { parseExpression } from 'cron-parser'
import { DB_DIR, ALARM_CRON_EXP, MAX_REPEAT } from '../../constants'
import { EventEmitter } from 'events'

export type SerializedReminder = {
    id: string
    name: string
    schedule: string
    date: string
    recurrence?: string
}

/**
 * Reminder
 *
 * @exception {pastReminderDatetime}
 * @exception {noTaskReminderAlarmFound}
 */
export class Reminder extends EventEmitter {
    id: string = ''
    date: Date = new Date()
    recurrence: string | null = null
    name: string | null = null
    schedule: string = ''
    taskReminder: ScheduledTask | null = null
    taskReminderBeep: ScheduledTask | null = null

    repeat: number = 0

    constructor(hermes: Hermes, date: Date, recurrence?: string, name?: string, id?: string) {
        super()

        this.id = id || timestamp('YYYYMMDD-HHmmss-ms')
        this.recurrence = recurrence || null
        this.name = name || null
        this.schedule = getScheduleString(date, this.recurrence)

        if (this.recurrence) {
            do {
                this.date = new Date(parseExpression(this.schedule).next().toString())
            } while (this.date < new Date())
        } else {
            this.date = date
        }

        this.makeAlive(hermes)
    }

    /**
     * Create and start cron task
     *
     * @param hermes
     */
    private makeAlive(hermes: Hermes) {
        const dialogId: string = `${ config.get().assistantPrefix }:reminder:${ this.id }`

        const onExpiration = () => {
            let tts: string = ''

            if (this.repeat < MAX_REPEAT) {
                this.repeat += 1
            } else {
                this.reset()
                return
            }

            tts += i18n.translate('alarm.info.expired', {
                name: this.name
            })

            hermes.dialog().sessionFlow(dialogId, (_, flow) => {
                flow.continue(`${ config.get().assistantPrefix }:StopSilence`, (_, flow) => {
                    this.reset()
                    flow.end()
                })
            })

            // Start a reminding session which plays sound and tts
            hermes.dialog().publish('start_session', {
                init: {
                    type: Enums.initType.action,
                    text: '[[sound:ding.ding]] ' + tts,
                    intentFilter: [
                        `${ config.get().assistantPrefix }:StopSilence`
                    ],
                    canBeEnqueued: true,
                    sendIntentNotRecognized: true
                },
                customData: dialogId,
                siteId: 'default'
            })
        }

        this.taskReminderBeep = cron.schedule(ALARM_CRON_EXP, onExpiration, { scheduled: false })
        this.taskReminder = cron.schedule(this.schedule, () => {
            if (this.taskReminderBeep) {
                this.taskReminderBeep.start()
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
            date: this.date.toJSON(),
            recurrence: this.recurrence
        })
    }

    /**
     * Save reminder info to fs
     */
    save() {
        fs.writeFile(path.resolve(DB_DIR, `${this.id}.json`), this.toString(), 'utf8', err => {
            if (err) {
                throw new Error(err.message)
            }
            logger.info(`Saved reminder: ${this.id} (${this.name})`)
        })
    }

    /**
     * Remove the saved copy from fs
     */
    delete() {
        this.destroy()

        fs.unlink(path.resolve(DB_DIR, `${this.id}.json`), err => {
            if (err) {
                throw new Error(err.message)
            }
            logger.info(`Deleted reminder: ${this.id} (${this.name})`)
        })
    }

    /**
     * Destroy all the cron tasks, releasing memory
     */
    destroy() {
        if (this.taskReminderBeep) {
            this.taskReminderBeep.stop()
            this.taskReminderBeep.destroy()
        }
        if (this.taskReminder) {
            this.taskReminder.stop()
            this.taskReminder.destroy()
        }
    }

    /**
     * Reset alarm, update nextExecution
     */
    reset() {
        if (this.taskReminderBeep) {
            this.taskReminderBeep.stop()
        }

        if (this.recurrence) {
            this.date = new Date(parseExpression(this.schedule).next().toString())
            this.save()
        } else {
            this.emit('shouldBeDeleted', this)
        }
    }
}
