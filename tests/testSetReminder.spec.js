require('./helpers/setup').bootstrap()
const Session = require('./helpers/session')
const {
    getMessageKey,
    getMessageOptions
} = require('./helpers/tools')
const {
    getTimeHuman
} = require('../src/tts/generateTime')
const {
    getTestDatetime,
    createReminderNameSlot,
    createDatetimeSlot,
    createRecurrenceSlot
} = require('./utils')

// basic test date
const testName = 'yoga class'
const testDatetime = getTestDatetime() // 24 hours later
const testRecurrence = 'mondays'

//  all slots are filled with good values
it(`should create a reminder which has name ${testName}`, async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:SetReminder',
        input: 'Reminde me to take yoga class every monday at five',
        slots: [
            createReminderNameSlot(testName),
            createDatetimeSlot(testDatetime.snips),
            createRecurrenceSlot(testRecurrence)
        ]
    })

    const { key, options } = JSON.parse((await session.end()).text)
    expect(key).toBe('setReminder.info.reminder_SetFor_')
    expect(options.name).toBe(testName)
    expect(options.time).toBe(getTimeHuman(testDatetime.js, testRecurrence))
})

// no slots provided
it(`should create a reminder by asking necessary data`, async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:SetReminder',
        input: 'Create a reminder'
    })

    const askNameAndTime = await session.continue({
        intentName: 'snips-assistant:SetReminder',
        input: 'go to yoga class tomorrow',
        slots: [
            createReminderNameSlot(testName),
            createDatetimeSlot(testDatetime.snips)
        ]
    })
    expect(getMessageKey(askNameAndTime)).toBe('setReminder.ask.nameAndTime')

    const { key, options } = JSON.parse((await session.end()).text)
    expect(key).toBe('setReminder.info.reminder_SetFor_')
    expect(options.name).toBe(testName)
    expect(options.time).toBe(getTimeHuman(testDatetime.js))
})

// only name provided
it(`should create a reminder by asking datetime/recurrence`, async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:SetReminder',
        input: 'Remind me to go to yoga class',
        slots: [
            createReminderNameSlot(testName)
        ]
    })

    const askNameAndTime = await session.continue({
        intentName: 'snips-assistant:SetReminder',
        input: 'tomorrow',
        slots: [
            createDatetimeSlot(testDatetime.snips)
        ]
    })
    expect(getMessageKey(askNameAndTime)).toBe('setReminder.ask.time')

    const { key, options } = JSON.parse((await session.end()).text)
    expect(key).toBe('setReminder.info.reminder_SetFor_')
    expect(options.name).toBe(testName)
    expect(options.time).toBe(getTimeHuman(testDatetime.js))
})

// only datetime provided
it(`should create a reminder by asking name`, async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:SetReminder',
        input: 'Remind me tomorrow',
        slots: [
            createDatetimeSlot(testDatetime.snips)
        ]
    })

    const askNameAndTime = await session.continue({
        intentName: 'snips-assistant:SetReminder',
        input: 'to go to yoga class',
        slots: [
            createReminderNameSlot(testName)
        ]
    })
    expect(getMessageKey(askNameAndTime)).toBe('setReminder.ask.name')

    const { key, options } = JSON.parse((await session.end()).text)
    expect(key).toBe('setReminder.info.reminder_SetFor_')
    expect(options.name).toBe(testName)
    expect(options.time).toBe(getTimeHuman(testDatetime.js))
})

// only recurrence provided
it(`should create a reminder by asking name`, async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:SetReminder',
        input: 'Remind me every monday',
        slots: [
            createRecurrenceSlot(testRecurrence)
        ]
    })

    const askNameAndTime = await session.continue({
        intentName: 'snips-assistant:SetReminder',
        input: 'to go to yoga class',
        slots: [
            createReminderNameSlot(testName)
        ]
    })
    expect(getMessageKey(askNameAndTime)).toBe('setReminder.ask.name')

    const { key, options } = JSON.parse((await session.end()).text)
    expect(key).toBe('setReminder.info.reminder_SetFor_')
    expect(options.name).toBe(testName)
    expect(options.time).toBe(getTimeHuman(new Date(Date.now()),testRecurrence))
})