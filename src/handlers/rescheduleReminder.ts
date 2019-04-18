import { Handler } from './index'
import { logger } from '../utils'

export const rescheduleReminderHandler: Handler = async function (msg, flow, hermes, options) {
    logger.debug('rescheduleReminder')
    flow.end()
}