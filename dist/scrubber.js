"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const scrubber = (paths, filler = 'scrubbed') => (obj) => {
    if (obj.toJSON) {
        // eslint-disable-next-line
        obj = obj.toJSON();
    }
    const [setters, matchers] = lodash_1.default.partition(paths, lodash_1.default.isString);
    lodash_1.default.forEach(setters, p => lodash_1.default.get(obj, p) && lodash_1.default.set(obj, p, filler));
    lodash_1.default.forEach(matchers, ({ path, regex, filler: matcherFiller }) => lodash_1.default.set(obj, path, lodash_1.default.get(obj, path).replace(new RegExp(regex), matcherFiller || filler)));
    return obj;
};
exports.default = scrubber;
//# sourceMappingURL=scrubber.js.map