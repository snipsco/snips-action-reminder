# snips-app-reminder

Snips action code for reminder app written in Javascript.

Working in progress.

## Test & Demo cases

### `SetReminder`

#### Create a reminder for the current time of tomorrow
> *Hey Snips, remind me to call my sister tomorrow*

#### Create a reminder that will make sound 2 minutes after (Quick demo one)
> *Hey Snips, remind me to take out the pizza in 2 minutes*

#### Create a reminder for the current time and date of the next month
> *Hey Snips, remind me to 'call the back' next month*

#### Create a daily reminder
> *Hey Snips, remind me to 'go to school' every day*

### `GetReminder`

#### Query reminders of next week
> *Hey Snips, what reminders do I have for the next week?*

#### Query reminders of the past
> *Hey Snips, do I have any past reminders?*

#### Query a reminder by its name
> *Hey Snips, show me my reminder of 'call my sister'*

#### Query reminders with recurrence
> *Hey Snips, show me all the weekly reminders*

### `RenameReminder`

Coming soon

### `RescheduleReminder`

Coming soon

### `CancelReminder`

#### Cancel all the reminders
> *Hey Snips, delete all my reminders*

#### Cancel reminders for tomorrow
> *Hey Snips, cancel all my reminders for tomorrow*

#### Cancel a reminder by its name
> *Hey Snips, cancel the reminder 'call my sister'*

#### Cancel a reminder by its recurrence
> *Hey Snips, cancel all the daily reminders*

## Known Issues

### TTS can pronounce and can't pronounce

- :white_check_mark: "February 28, 3:00 PM"
- :x: "March 7, 10:54 AM"
- :x: "February 28, 11:00 AM"
- :white_check_mark: "February 28, 5:30 PM"
- :x: "March 1, 10:00 AM"

## Planned features & To do

### Set a reminder

- [x] Name, datetime, recurrence are all provided
- [x] No slots provided
- [x] Name is not provided
- [x] Time or recurrences is not provided
- [x] Full test

### Query a reminder

- [x] No reminder registered, no slot provided
- [x] And the other cases..
- [x] Full test

### Reschedule a reminder

- [ ] No reminder registered, no slot provided

And the other cases..

### Rename a reminder

- [ ] No reminder registered, no slot provided

And the other cases..

### Cancel a reminder

- [x] No reminder registered, no slot provided
- [x] And the other cases..
- [ ] Full test

## Contributing

Please see the [Contribution Guidelines](https://github.com/snipsco/snips-app-reminder/blob/master/CONTRIBUTING.md).

## Copyright

This library is provided by [Snips](https://www.snips.ai) as Open Source software. See [LICENSE](https://github.com/snipsco/snips-app-reminder/blob/master/LICENSE) for more information.