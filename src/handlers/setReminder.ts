import { Handler } from './index'
import { logger } from '../utils'

export const setReminderHandler: Handler = async function (msg, flow, hermes, options) {
    logger.debug('setReminder')
    flow.end()
}