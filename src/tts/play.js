const fs = require('fs')
const path = require('path')
const { Hermes } = require('hermes-javascript')
const { logger } = require('../utils')
const alarmWav = fs.readFileSync(path.resolve(__dirname, '../../assets/alarm.wav'))

module.exports = (siteId = 'default') => {
    logger.info('Playing sound')

    const hermes = new Hermes()
    const audio = hermes.audio()

    audio.publish('play_audio', {
        id: '0',
        siteId: siteId,
        wavBytes: alarmWav,
        wavBytesLen: alarmWav.length
    })
}