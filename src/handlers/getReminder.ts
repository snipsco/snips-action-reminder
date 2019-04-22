import { Handler } from './index'
import { logger } from '../utils'

export const getReminderHandler: Handler = async function (msg, flow, database, options) {
    logger.debug('getReminder')
    flow.end()
}