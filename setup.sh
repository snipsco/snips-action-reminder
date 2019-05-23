#!/bin/sh

# File names definition
CONFIG_FILE_DEFAULT="config.ini.default"
CONFIG_FILE="config.ini"
DB=".db_reminders"

# Install dependencies and compile typescript
#npm install && npm run build

# Check user configuration file
if [ ! -e ${CONFIG_FILE} ]
then
    cp ${CONFIG_FILE_DEFAULT} ${CONFIG_FILE}
fi

# Check reminder database folder
if [ ! -e ${DB} ]
then
    echo "created db folder"
    mkdir ${DB}
else
    echo "found db folder"
fi