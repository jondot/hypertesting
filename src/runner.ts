#!/usr/bin/env node

// eslint-disable-next-line
import { run } from 'jest'

const args = ['--config', '{"testRegex":".*"}'].concat(process.argv.splice(2))
// console.log('args:', args)
run(args)
