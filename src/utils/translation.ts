import { i18nFactory } from '../factories/i18nFactory'

function getRandom(key: string | string[], opts: {[key: string]: any} = {}): string {
    const i18n = i18nFactory.get()
    const possibleValues = i18n(key, { returnObjects: true, ...opts })
    if(typeof possibleValues === 'string')
        return possibleValues
    const randomIndex = Math.floor(Math.random() * possibleValues.length)
    return possibleValues[randomIndex]
}

async function getError(error: Error) {
        let i18n = i18nFactory.get()

        if(!i18n) {
            await i18nFactory.init()
            i18n = i18nFactory.get()
        }

        if(i18n) {
            return getRandom(`error.${error.message}`)
        } else {
            return 'Oops, something went wrong.'
        }
    },
    // Takes an array from the i18n and returns a random item.
    random,
    reportSetReminder
}