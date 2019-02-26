const { message, logger, math } = require('../utils')
const {
    INTENT_PROBABILITY_THRESHOLD,
    SLOT_CONFIDENCE_THRESHOLD,
    ASR_TOKENS_CONFIDENCE_THRESHOLD
} = require('../constants')

module.exports = async (msg, knownSlots = {}) => {
    logger.debug('message intent: %o', msg)

    if (msg.intent) {
        if (msg.intent.confidenceScore < INTENT_PROBABILITY_THRESHOLD) {
            throw 'intentNotRecognized -> lowThreshold'
        }

        if (message.getAsrConfidence(msg) < ASR_TOKENS_CONFIDENCE_THRESHOLD) {
            throw 'intentNotRecognized -> lowGeometricMean'
        }
    }

    let slots = [
        'reminder_name',
        'datetime',
        'recurrence',
        'all_reminders',
        'past_reminders',
        'former_reminder_name',
        'former_reminder_datetime',
        'new_reminder_name',
        'new_reminder_datetime',
    ]

    let res = {}

    slots.forEach( (slot) => {
        if (!(slot in knownSlots)) {
            let tempSlot = message.getSlotsByName(msg, slot, {
                onlyMostConfident: true,
                threshold: SLOT_CONFIDENCE_THRESHOLD
            })
            if (tempSlot) {
                if (tempSlot.entity == 'snips/datetime') {
                    res[slot] = tempSlot.value
                } else {
                    res[slot] = tempSlot.value.value
                }
            }
        } else {
            res[slot] = knownSlots[slot]
        }
        if (res[slot]) {
            logger.info(`\t${slot} : `, res[slot])
        }
    })

    return res
}