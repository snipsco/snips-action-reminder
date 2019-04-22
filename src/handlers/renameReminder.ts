import { Handler } from './index'
import { logger } from '../utils'

export const renameReminderHandler: Handler = async function (msg, flow, database, options) {
    logger.debug('renameReminder')
    flow.end()
}