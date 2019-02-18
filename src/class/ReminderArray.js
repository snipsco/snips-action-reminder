
module.exports = class ReminderArray extends Array {

    constructor (...args) {
        super(...args);
    }

    // addAndStart (reminder) {
    //     let num = this.push(reminder)
    //     this(num-1).task.start()
    // }

    start () {
        console.log('start method called')
    }

    remove_expired () {
        console.log('remove expired called')
    }
}