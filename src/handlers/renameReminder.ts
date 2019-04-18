import { Handler } from './index'
import { logger } from '../utils'

export const renameReminderHandler: Handler = async function (msg, flow, hermes, options) {
    logger.debug('renameReminder')
    flow.end()
}