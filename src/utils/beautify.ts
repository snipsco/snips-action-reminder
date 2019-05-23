import { config, i18n } from 'snips-toolkit'
import moment from 'moment'
import { DatetimeRange } from './parser'

export const beautify = {
    date: (date: Date): string => {
        return moment(date).locale(config.get().locale).calendar(undefined, {
            sameDay: i18n.translate('moment.date.sameDay'),
            nextDay: i18n.translate('moment.date.nextDay'),
            nextWeek: i18n.translate('moment.date.nextWeek'),
            sameElse: i18n.translate('moment.date.sameElse')
        }).replace(' 0', '')
    },
    time: (date: Date): string => {
        return moment(date)
            .locale(config.get().locale)
            .format(i18n.translate('moment.time.12H'))
            .replace(' 0', '')
    },
    datetime: (date: Date): string => {
        return moment(date).locale(config.get().locale).calendar(undefined, {
            sameDay: i18n.translate('moment.datetime.sameDay'),
            nextDay: i18n.translate('moment.datetime.nextDay'),
            nextWeek: i18n.translate('moment.datetime.nextWeek'),
            sameElse: i18n.translate('moment.datetime.sameElse')
        }).replace(' 0', '')
    },
    daterange: (datetimeRange: DatetimeRange): string => {
        if ((new Date(datetimeRange.min)).getDay() === 5 && new Date(datetimeRange.max).getDay() === 1) {
            return i18n.translate('moment.daterange.weekEnd')
        }

        if (new Date(datetimeRange.min).getDay() === 1 && new Date(datetimeRange.max).getDay() === 1) {
            return i18n.translate('moment.daterange.nextWeek')
        }

        return i18n.translate('moment.daterange.fromTo', {
            dateMin: beautify.date(new Date(datetimeRange.min)),
            dateMax: beautify.date(new Date(datetimeRange.max - 1000))
        })
    },
    recurrence: (date: Date, recurrence: string): string => {
        if (recurrence === 'daily') {
            return i18n.translate('moment.recurrence.daily')
        }

        return moment(date).locale(config.get().locale).calendar(undefined, {
            sameDay: i18n.translate('moment.recurrence.every'),
            nextDay: i18n.translate('moment.recurrence.every'),
            nextWeek: i18n.translate('moment.recurrence.every'),
            sameElse: i18n.translate('moment.recurrence.every')
        }).replace(' 0', '')
    }
}
