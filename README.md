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

#### Rename a unique defined reminder
> *Hey Snips, I would like to rename the reminder 'call the bank' to 'call my sister'*

#### Rename the unique reminder found set for today/tomorrow
**(If there is only one reminder set for that day)**
> *Hey Snips, I would like to rename the reminder I set for today*

### `RescheduleReminder`

#### Reschedule a reminder by using its name
*`You: Hey Snips, I want to reschedule the reminder 'take out the pizza'`*

*`Snips: How should I reschedule this reminder?`*

*`You: At 11 o'clock`*

### `CancelReminder`

#### Cancel all the reminders
> *Hey Snips, delete all my reminders*

#### Cancel reminders for tomorrow
> *Hey Snips, cancel all my reminders for tomorrow*

#### Cancel a reminder by its name
> *Hey Snips, cancel the reminder 'call my sister'*

#### Cancel a reminder by its recurrence
> *Hey Snips, cancel all the daily reminders*

## Nice to have

- [ ] When a reminder arrives, we should be able to reschedule it. (RescheduleReminder for the non-recurrence, create new for recurrence one)
- [ ] `What reminder do I have next?`, `What's my previous reminder?`

## Known Issues

### :x: Assistant issue with key word `every week`

### :x: TTS for all the recurrence reminders

Now when we have a query like "Please remind me to call the back every weekend", tts will play: "reminder <reminder_name> is set for today at <time> weekends"

### :x: TTS for `all_reminders` slots filled and non-filled

Now when we have multi reminders in the system, it will always say `I'v found <number> reminders, reminder .. reminder .. `

It's better change it to the following:

If the slot `all_reminders` is filled: "I'v found <number> reminders, reminder .. reminder .. "

If the slot `all_reminders` is not filled: "I'v found <number> reminders, the most recent one is <reminder_name> set for <time>, would you like to listen all the rest reminders?"

### :x: Handle the reminders that is set for a past time

Now when we have a query to set a reminder for "yesterday", this will work. But actually it shouldn't.

### :x: Handle the time period case `TimeInterval`

Now when a time period detected, like query "remind me to go to my parents this weekend", the `datetime` slot will be detected as time period. This should be handled.

Same for the `start time`, probably for `end time` as well

### :x: Keep the reminders only for a couple of days

Now the system will keep all the created reminders. The design is the system should only keep the reminders expired for not more than some days (for example two weeks). This should be able to config in the user config file.

### :white_check_mark:[Solved] Datetime tts pronunciation

Test data with pico-tts:

- :white_check_mark: "February 28, 3:00 PM"
- :x: "March 7, 10:54 AM"
- :x: "February 28, 11:00 AM"
- :white_check_mark: "February 28, 5:30 PM"
- :x: "March 1, 10:00 AM"

Solved by generating the tts that without any `,` , `:` and `00` in the sentence.

New issue:

This format should adapt to `local` setting. Same for recurrence.

### :x: Reminders that have recurrence

This will work as a recurrence job, but still `datetime` needs to be updated after each execution to be clear for user's query

### :x: *"Remind me to 'do sth' today"*

This query will create a reminder by using the current date and time. It doesn't make any sense. This case need to be handled as a special.

### :interrobang: *"Please cancel all the reminders"*

Not sure if this is an issue.

This action will delete all the coming reminders, the past reminders will be kept for checking.

### :interrobang: Bundle and flow chart

These are not crucial problems, but it's better to change to simplify the logic.

For all the intents, `reminder_name` can be changed to `name`

For `RenameReminder`, `former_reminder_name` can be changed to `reminder_name`(Or `name`).

For `RescheduleReminder`, `former_reminder_datetime` can be changed to `datetime`.

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