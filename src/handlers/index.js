const { translation, logger } = require('../utils')

// Wrap handlers to gracefully capture errors
const handlerWrapper = handler => (
    async (message, flow, ...args) => {
        logger.debug('message: %O', message)
        try {
            // Run handler until completion
            const tts = await handler(message, flow, ...args)
            // And make the TTS speak
            return tts
        } catch (error) {
            // If an error occurs, end the flow gracefully
            flow.end()
            // And make the TTS output the proper error message
            logger.error(error)
            return await translation.errorMessage(error)
        }
    }
)

// Add handlers here, and wrap them.
module.exports = {
    setReminder: handlerWrapper(require('./setReminder'))
    //getReminder: handlerWrapper(require('./getReminder')),
    //rescheduleReminder: handlerWrapper(require('./rescheduleReminder')),
    //renameReminder: handlerWrapper(require('./renameReminder')),
    //cancelReminder: handlerWrapper(require('./cancelReminder')),
}