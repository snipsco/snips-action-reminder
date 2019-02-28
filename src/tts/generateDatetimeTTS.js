const numberToMonth = {
    "en":[
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ]
}
/**
 * @brief Refering to the currenct datetime, generate a nice time tts reply
 *
 * @Example If the datetime is generated for today, it should not report date and month
 *
 * @param {Date Object} datetime, used to generate tts message
 * @param {String} recurence
 * @return {String} tts message that is ready to play
 */
module.exports = (datetime) => {
    const today = new Date(Date.now())
    const tomorrow = new Date(today.getTime() + 1000 * 60 * 60 * 24)
    //const yesterday = new Date(today.getTime() - 1000 * 60 * 60 * 24)
    const year = (datetime.getFullYear() > today.getFullYear()) ? datetime.getFullYear() : ''
    const month = numberToMonth.en[datetime.getMonth()]
    const date = datetime.getDate()
    const time = datetime.toLocaleString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: 'numeric'
    }).replace(':', ' ').replace('00','')



    // check if it's today
    if (
        today.getDate() === datetime.getDate() &&
        today.getMonth() === datetime.getMonth() &&
        today.getFullYear() === datetime.getFullYear()
    ) {
        // it's today
        return `today at ${time}`
    } else if (
        tomorrow.getDate() === datetime.getDate() &&
        tomorrow.getMonth() === datetime.getMonth() &&
        tomorrow.getFullYear() === datetime.getFullYear()
    ) {
        // it's tomorrow
        return `tomorrow at ${time}`
    } else {
        if (date === 1) {
            return `the first of ${month} at ${time} ${year}`
        }
        if (date === 2) {
            return `the second of ${month} at ${time} ${year}`
        }
        if (date === 3) {
            return `the third of ${month} at ${time} ${year}`
        } else {
            return `the ${date}th of ${month} at ${time} ${year}`
        }
    }
}