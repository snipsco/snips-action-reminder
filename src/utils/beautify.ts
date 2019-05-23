import { configFactory, i18nFactory } from '../factories'
import { LANGUAGE_MAPPINGS } from '../constants'
import moment from 'moment'
import { DatetimeRange } from './parser'

export const beautify = {
    date: (date: Date): string => {
        const i18n = i18nFactory.get()
        const config = configFactory.get()
        const language = LANGUAGE_MAPPINGS[config.locale]

        return moment(date).locale(language).calendar(undefined, {
            sameDay: i18n('moment.date.sameDay'),
            nextDay: i18n('moment.date.nextDay'),
            nextWeek: i18n('moment.date.nextWeek'),
            sameElse: i18n('moment.date.sameElse')
        }).replace(' 0', '')
    },
    time: (date: Date): string => {
        const i18n = i18nFactory.get()
        const config = configFactory.get()
        const language = LANGUAGE_MAPPINGS[config.locale]

        return moment(date)
            .locale(language)
            .format(i18n('moment.time.12H'))
            .replace(' 0', '')
    },
    datetime: (date: Date): string => {
        const i18n = i18nFactory.get()
        const config = configFactory.get()
        const language = LANGUAGE_MAPPINGS[config.locale]

        return moment(date).locale(language).calendar(undefined, {
            sameDay: i18n('moment.datetime.sameDay'),
            nextDay: i18n('moment.datetime.nextDay'),
            nextWeek: i18n('moment.datetime.nextWeek'),
            sameElse: i18n('moment.datetime.sameElse')
        }).replace(' 0', '')
    },
    daterange: (datetimeRange: DatetimeRange): string => {
        const i18n = i18nFactory.get()

        if ((new Date(datetimeRange.min)).getDay() === 5 && new Date(datetimeRange.max).getDay() === 1) {
            return i18n('moment.daterange.weekEnd')
        }

        if (new Date(datetimeRange.min).getDay() === 1 && new Date(datetimeRange.max).getDay() === 1) {
            return i18n('moment.daterange.nextWeek')
        }

        return i18n('moment.daterange.fromTo', {
            dateMin: beautify.date(new Date(datetimeRange.min)),
            dateMax: beautify.date(new Date(datetimeRange.max - 1000))
        })
    },
    recurrence: (date: Date, recurrence: string): string => {
        const i18n = i18nFactory.get()
        const config = configFactory.get()
        const language = LANGUAGE_MAPPINGS[config.locale]

        if (recurrence === 'daily') {
            return i18n('moment.recurrence.daily')
        }

        return moment(date).locale(language).calendar(undefined, {
            sameDay: i18n('moment.recurrence.every'),
            nextDay: i18n('moment.recurrence.every'),
            nextWeek: i18n('moment.recurrence.every'),
            sameElse: i18n('moment.recurrence.every')
        }).replace(' 0', '')
    }
}