function getDatetimeRange(datetimeSnips) {
    const min = new Date(datetimeSnips.value)
    switch (datetimeSnips.grain) {
        case 'Minute':
            return {min, max: min.getTime() + 1000 * 60}
        case 'Hour':
            return {min, max: min.getTime() + 1000 * 60 * 60}
        case 'Day':
            return {min, max: min.getTime() + 1000 * 60 * 60 * 24}
        case 'Week':
            return {min, max: min.getTime() + 1000 * 60 * 60 * 24 * 7}
        case 'Month':
            return {min, max: min.getTime() + 1000 * 60 * 60 * 24 * 30}
        case 'Year':
            return {min, max: min.getTime() + 1000 * 60 * 60 * 24 * 365}
        default:
            // Not sure which will be this case
            return {min, max: min.getTime() + 1000 * 60}
    }
}

/**
 * @brief Check if a snips/datetime object can match to the provided js datetime object
 *
 * @Example Snips/Datetime "2019-03-01 00:00:00 +00:00" with grain "Day" should
 *          be conveted to a time range from <2019-03-01 00:00:00 +00:00> to
 *          <2019-03-01 23:59:59 +00:00> in Date object format.
 *          If the second parameter has a value <2019-03-01 18:20:00 +00:00>,
 *          return <true>.
 *          If the second parameter has a value <2019-03-02 15:25:00 +00:00>,
 *          return <false>.
 *
 * @param {Snips/Datetime Object} datetimeSnips, used to convert to a range
 * @param {Date Object} datetimeObj, check if this value is in the range
 * @return {boolean}
 */
module.exports = (datetimeSnips, datetimeObj) => {
    const range = getDatetimeRange(datetimeSnips)
    return (
        (datetimeObj.getTime() >= range.min) &&
        (datetimeObj.getTime() < range.max)
    ) ? true : false
}