const fs = require('fs')
const path = require('path')
const { logger } = require('../utils')
const { Reminder } = require('../class')
const { i18nFactory } = require('../factories')

module.exports = class ReminderArray extends Array {
    constructor (remindersPath) {
        super()

        this.remindersPath = remindersPath
    }

    loadSavedReminders () {
        
    }


}