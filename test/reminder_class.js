#!/usr/bin/env node

const Reminder = require('../src/utils/').reminder

//var rem = new Reminder('take out my pizza', '2019-01-30 16:17:00 +01:00')
try {
    var rem = new Reminder('take out my pizza', '2019-01-30 16:55:00 +01:00')
    rem.debug_dump()
} catch (e) {
    console.log(e)
}