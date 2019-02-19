module.exports = {
    BINDINGS: [
        {
            intent: 'snips-assistant:SetReminder',
            action: require('./handlers').setReminder
        },
        {
            intent: 'snips-assistant:GetReminders',
            action: require('./handlers').getReminder
        },
        {
            intent: 'snips-assistant:RescheduleReminder',
            action: require('./handlers').rescheduleReminder
        },
        {
            intent: 'snips-assistant:RenameReminder',
            action: require('./handlers').renameReminder
        },
        {
            intent: 'snips-assistant:Stop',
            action: require('./handlers').stop
        }
    ]
}