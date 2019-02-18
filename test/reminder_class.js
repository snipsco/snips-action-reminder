#!/usr/bin/env node
const debug = require('debug')
const Reminder = require('../src/class/').reminder
const logger = require('../src/utils/').logger

debug.enable('reminder_class:*')

logger.info('I am a debug info')
logger.error('I am a debug error')
logger.debug('I am a debug debug')

//var rem = new Reminder('take out my pizza', '2019-01-30 16:17:00 +01:00')
try {
    var rem = new Reminder('take out my pizza', '2019-01-30 16:55:00 +01:00')
    rem.debug_dump()
    rem.task.start()
    rem.save()
} catch (e) {
    logger.error(e)
}