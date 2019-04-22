import { Handler } from './index'
import { logger } from '../utils'

export const rescheduleReminderHandler: Handler = async function (msg, flow, database, options) {
    logger.debug('rescheduleReminder')
    flow.end()
}