"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const scrubber_1 = __importDefault(require("../scrubber"));
const fixture_1 = __importDefault(require("./fixture"));
const integration = (createServer, scrubPaths, fixturePath) => (desc, fn) => {
    const scrubRequest = scrubber_1.default(scrubPaths);
    const snapshot = (req) => expect(scrubRequest(req)).toMatchSnapshot();
    it(desc, () => __awaiter(this, void 0, void 0, function* () {
        const server = yield createServer();
        yield fixture_1.default(server.connection, fixturePath);
        const request = supertest_1.default(server.app);
        yield fn(request, snapshot);
        yield server.connection.close();
    }));
};
exports.default = integration;
//# sourceMappingURL=integration.js.map