const fs = require("fs")
const path = require('path')

let reminders = null

async function init(){
    reminders = new Array()

    fs.readdir(__dirname + '/../../reminder_records/', (err, files) => {
        if(err){
            console.log(err)
        }
        files.forEach(file => {
            console.log(file)
        })
    })
}

module.export = {
    init,
    reminders
}