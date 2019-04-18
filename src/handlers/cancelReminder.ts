import { Handler } from './index'
import { logger } from '../utils'

export const cancelReminderHandler: Handler = async function (msg, flow, hermes, options) {
    logger.debug('cancelReminder')
    flow.end()
}