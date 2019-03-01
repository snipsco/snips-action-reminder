#!/bin/sh

npm install

if [ ! -e "./config.ini" ]
then
    cp config.ini.default config.ini
fi

mkdir reminder_records