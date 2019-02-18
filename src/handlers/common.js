const { message, logger, math } = require('../utils')
const { configFactory } = require('../factories')
const {
    HOME_SYNONYMS,
    WORK_SYNONYMS,
    INTENT_PROBABILITY_THRESHOLD,
    SLOT_CONFIDENCE_THRESHOLD,
    ASR_TOKENS_CONFIDENCE_THRESHOLD
} = require('../constants')

module.exports = async function (msg, knownSlots = {}) {
    if (msg.intent.probability < INTENT_PROBABILITY_THRESHOLD) {
        throw new Error('intentNotRecognized')
    }
    // if (math.geometricMean(msg.asr_tokens.map(token => token.confidence)) < ASR_TOKENS_CONFIDENCE_THRESHOLD) {
    //     throw new Error('intentNotRecognized')
    // }

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

    res = { }

    slots.forEach( (slot) => {
        if (!('reminder_name' in knownSlots)) {
            let tempSlot = message.getSlotsByName(msg, slot, {
                onlyMostConfident: true,
                threshold: SLOT_CONFIDENCE_THRESHOLD
            })
            if (tempSlot) {
                if (tempSlot.entity == 'snips/datetime') {
                    res[slot] = tempSlot.value.value.value
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