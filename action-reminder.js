#!/usr/bin/env node

process.env.DEBUG_DEPTH=true

const debug = require('debug')
const { name } = require('./package.json')

debug.enable(name + ':*')

require('./src/index')()