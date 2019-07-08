import { Test } from 'snips-toolkit'
import {
    createDateSlot,
    createNameSlot,
    createRecurrenceSlot,
    sleep
} from './utils'

const { Session, Tools } = Test
const { getMessageKey, getMessageOptions } = Tools

beforeAll(() => {
    // Wait one second for the action bootstrap
    return sleep(1000)
})

describe('Reminder app', () => {
    it('should set a new reminder on monday 6 am', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:SetReminder',
            input: 'Schedule a reminder on monday at 6 am',
            slots: [
                createDateSlot('2019-05-27 06:00:00 +00:00')
            ]
        })

        const elicitationMsg = await session.continue({
            intentName: 'snips-assistant:ElicitReminderName',
            input: 'go to the swimming pool',
            slots: [
                createNameSlot('go to the swimming pool')
            ]
        })
        expect(getMessageKey(elicitationMsg)).toBe('setReminder.ask.name')

        const endMsg = await session.end()
        expect(getMessageKey(endMsg)).toBe('setReminder.info.scheduled')
    })

    it('should set a new named reminder on tuesday 6 pm', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:SetReminder',
            input: 'Schedule a reminder named walk the dog on tuesday at 6 pm',
            slots: [
                createDateSlot('2019-05-28 18:00:00 +00:00'),
                createNameSlot('walk the dog')
            ]
        })

        const endMsg = await session.end()
        expect(getMessageKey(endMsg)).toBe('setReminder.info.scheduled')
    })

    it('should get the 2 reminders status', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:GetReminder',
            input: 'What is the status of my reminders?'
        })

        const endMsg = await session.end()
        expect(endMsg.text && endMsg.text.includes('getReminder.head.found')).toBeTruthy()
    })

    it('should cancel the reminder named walk the dog', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:CancelReminder',
            input: 'Can you cancel the reminder named walk the dog?',
            slots: [
                createNameSlot('walk the dog')
            ]
        })

        const endMsg = await session.end()
        expect(getMessageKey(endMsg)).toBe('cancelReminder.info.confirm')
    })

    it('should set a new named reminder every wednesday at 8 pm', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:SetReminder',
            input: 'Schedule a reminder named yoga class every wednesday at 10 pm',
            slots: [
                createDateSlot('2019-05-28 20:00:00 +00:00'),
                createNameSlot('yoga class'),
                createRecurrenceSlot('wednesdays')
            ]
        })

        const endMsg = await session.end()
        expect(getMessageOptions(endMsg).name).toBe('yoga class')
        expect(getMessageOptions(endMsg).recurrence).toBe('every Wednesday at 10 PM')
        expect(getMessageOptions(endMsg).context).toBe('name_recurrence')
        expect(getMessageKey(endMsg)).toBe('setReminder.info.scheduled')
    })

    it('should cancel all the reminders', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:CancelReminder',
            input: 'Can you cancel all the reminders?'
        })

        const confirmationMsg = await session.continue({
            intentName: 'snips-assistant:Yes',
            input: 'Yes'
        })
        expect(getMessageKey(confirmationMsg)).toBe('cancelReminder.ask.confirm')
        expect(confirmationMsg.intentFilter && confirmationMsg.intentFilter.includes('snips-assistant:Yes')).toBeTruthy()

        const endMsg = await session.end()
        expect(getMessageKey(endMsg)).toBe('cancelReminder.info.confirmAll')
    })
})
