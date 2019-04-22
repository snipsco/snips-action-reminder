import { configFactory, i18nFactory } from '../factories'
import { LANGUAGE_MAPPINGS } from '../constants'
import moment from 'moment'

export const beautify = {    
    date: (date: Date): string => {
        const i18n = i18nFactory.get()
        const config = configFactory.get()
        const language = LANGUAGE_MAPPINGS[config.locale]

        return moment(date).locale(language).calendar(undefined, {
            sameDay: i18n('moment.sameDay'),
            nextDay: i18n('moment.nextDay'),
            nextWeek: i18n('moment.nextWeek'),
            sameElse: i18n('moment.sameElse'),
        })
    },

    time: (date: Date): string => {
        const i18n = i18nFactory.get()
        const config = configFactory.get()
        const language = LANGUAGE_MAPPINGS[config.locale]

        return moment(date)
            .locale(language)
            .format(i18n('moment.time'))
            .replace(' 0', '')
    }
}