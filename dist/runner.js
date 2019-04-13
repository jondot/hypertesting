#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jest_1 = require("jest");
const args = ['--config', '{"testRegex":".*"}'].concat(process.argv.splice(2));
// console.log('args:', args)
jest_1.run(args);
//# sourceMappingURL=runner.js.map