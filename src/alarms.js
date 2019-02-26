const cron = require('node-cron')

const i18nFactory = require('./factories/i18nFactory')

const alarms = []
// play the tts sound each 15 seconds (dialogue timeout max 15 seconds)
const alarmSchedule = '*/15 * * * * *'

function initAlarm(name, id) {
    const taskAlarm = cron.schedule(alarmSchedule, () => {
        const i18n = i18nFactory.get()
        let message = i18n('info.remind', {
            name: name
        })
        const tts = require('./tts')
        tts.ask(message, JSON.stringify({
            reminder_id: id
        }))
    }, {
        scheduled: false
    })

    return {
        id,
        name,
        taskAlarm
    }
}

module.exports = {
    createAlarm(name, id) {
        const alarm = initAlarm(name, id)
        if (alarm) {
            alarms.push(alarm)
            alarm.taskAlarm.start()
            return true
        }
        return false
    },
    deleteAlarm(id) {
        const alarm = alarms.filter(alarm => alarm.id === id)
        if (alarm.length === 1) {
            alarm[0].taskAlarm.stop()
            alarm[0].taskAlarm.destroy()
            alarms.splice(alarms.indexOf(alarm), 1)
            return true
        }
        return false
    },
    destroyAllAlarm() {
        alarms.forEach(alarm => {
            alarm.taskAlarm.stop()
            alarm.taskAlarm.destroy()
        })
    }
}