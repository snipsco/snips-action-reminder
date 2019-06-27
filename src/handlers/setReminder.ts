import handlers from './index'
import { translation } from '../utils'
import { logger, i18n, Handler, config } from 'snips-toolkit'
import { ReminderSlots, extractSlots, nextOptions, flowContinueTerminate } from './common'
import { ReminderInit, Reminder } from '../class/Reminder'
import { INTENT_ELICITATION } from '../constants'
import { IntentMessage, FlowContinuation } from 'hermes-javascript/types'

export const setReminderHandler: Handler = async function (msg, flow, database, options) {
    logger.debug(`${msg.intent.intentName}, depth: ${options.depth}`)

    flowContinueTerminate(flow)

    // Add handler for intentNotRecognized
    flow.notRecognized((_, flow) => {
        return handlers.setReminder(msg, flow, database, nextOptions(options, slots))
    })

    // Extract slots
    const slots: ReminderSlots = extractSlots(msg, options)

    // Create a new reminder
    if (slots.reminderName && (slots.recurrence || slots.datetime)) {
        logger.debug('createReminder', slots)
        flow.end()

        const reminderInitObj: ReminderInit = {
            name: slots.reminderName,
            datetime: slots.datetime || undefined,
            recurrence: slots.recurrence || undefined
        }

        const reminder: Reminder = database.add(reminderInitObj)

        return translation.reportSetReminder(reminder)
    }

    // Intent not recognized
    if (options.depth === 0) {
        throw new Error('nluIntentErrorStanderd')
    }

    const elicitationCallback = (msg: IntentMessage, flow: FlowContinuation) => {
        return handlers.setReminder(msg, flow, database, nextOptions(options, slots))
    }

    // Require slot: name
    if (!slots.reminderName && (slots.recurrence || slots.datetime)) {
        flow.continue(`${ config.get().assistantPrefix }:${ INTENT_ELICITATION.name }`, elicitationCallback)
        return i18n.randomTranslation('setReminder.ask.name', {})
    }

    // Require slot: datetime or recurrence
    if (slots.reminderName && !(slots.recurrence || slots.datetime)) {
        flow.continue(`${ config.get().assistantPrefix }:${ INTENT_ELICITATION.time }`, elicitationCallback)
        return i18n.randomTranslation('setReminder.ask.time', {})
    }

    // Require slot: name, datetime/recurrence
    if (!slots.reminderName && !(slots.recurrence || slots.datetime)) {
        flow.continue(msg.intent.intentName, elicitationCallback)
        flow.continue(`${ config.get().assistantPrefix }:${ INTENT_ELICITATION.time }`, elicitationCallback)
        flow.continue(`${ config.get().assistantPrefix }:${ INTENT_ELICITATION.name }`, elicitationCallback)
        return i18n.randomTranslation('setReminder.ask.nameAndTime', {})
    }

    throw new Error('setReminderUnhandled')
}
