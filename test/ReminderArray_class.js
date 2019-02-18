#!/usr/bin/env node

const ReminderArray = require('../src/class/').ReminderArray
const Reminder = require('../src/class/').reminder

ReminderPoll = new ReminderArray()

for (var i = 0; i < 2; i++) {
    temp = new Reminder(`Test reminder ${i}`, '2019-01-31 15:46:00', 'daily')
    let index = ReminderPoll.push(temp) - 1
    ReminderPoll[index].task.start()
}

console.log(ReminderPoll.length)

ReminderPoll.forEach( (item, index, array) => {
    console.log(item, index)
})

while(1) {

}