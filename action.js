#!/usr/bin/env node
const debug = require('debug')
const { name } = require('./package.json')

debug.enable(name + ':*')

require('./src/index')()
