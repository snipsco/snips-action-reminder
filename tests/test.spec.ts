import { Test } from 'snips-toolkit'
import {
    createDateSlot,
    createNameSlot,
    createRecurrenceSlot,
    sleep
} from './utils'

const { Session, Tools } = Test
const { getMessageKey } = Tools

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

        const confirmationMsg = await session.continue({
            intentName: 'snips-assistant:Yes',
            input: 'Yes'
        })
        expect(confirmationMsg.intentFilter && confirmationMsg.intentFilter.includes('snips-assistant:Yes')).toBeTruthy()

        const endMsg = await session.end()
        expect(getMessageKey(endMsg)).toBe('cancelReminder.successfullyDeletedSingle')
    })

    it('should set a new named reminder every wednesday at 8 pm', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:SetReminder',
            input: 'Schedule a reminder named yoga class every wednesday at 8 pm',
            slots: [
                createDateSlot('2019-05-28 20:00:00 +00:00'),
                createNameSlot('yoga class'),
                createRecurrenceSlot('wednesdays')
            ]
        })

        const endMsg = await session.end()
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
        expect(confirmationMsg.intentFilter && confirmationMsg.intentFilter.includes('snips-assistant:Yes')).toBeTruthy()

        const endMsg = await session.end()
        expect(getMessageKey(endMsg)).toBe('cancelReminder.successfullyDeletedAll')
    })
})
