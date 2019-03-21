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
const js_yaml_1 = __importDefault(require("js-yaml"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ejs_1 = __importDefault(require("ejs"));
const lodash_1 = __importDefault(require("lodash"));
const defaultScrubber = (result) => {
    if (result.header.date) {
        // eslint-disable-next-line
        result.header.date = 'scrubbed';
    }
    if (result.header.etag) {
        // eslint-disable-next-line
        result.header.etag = 'scrubbed';
    }
    return result;
};
exports.defaultScrubber = defaultScrubber;
const defaultOpts = {
    scrubResult: defaultScrubber,
    formatTitle: (testfile, currentRequest) => `${path_1.default.join(...lodash_1.default.takeRight(testfile.split(path_1.default.sep), 2))} ${currentRequest.id}: ${currentRequest.desc}`,
    serializer: (value, serialize, indent) => {
        const { req: { method, url } } = value;
        return [
            `  ${method} ${url.replace(/127\.0\.0\.1:\d+/, 'test-service')}\n`,
            indent(serialize({
                request: { body: value.req.data, headers: value.req.headers },
                response: {
                    headers: value.header,
                    status: value.status,
                    body: value.text
                }
            }))
        ].join('\n');
    },
    announce: (currentRequest) => console.log('hypertest request', currentRequest),
    expect: null
};
exports.defaultOpts = defaultOpts;
const requestWithSupertest = (requestInfo, req) => new Promise((resolve, reject) => {
    req[requestInfo.method.toLowerCase()](requestInfo.path)
        .send(requestInfo.body)
        .set(requestInfo.headers || {})
        .set(requestInfo.query || {})
        .end((err, res) => {
        if (err) {
            reject(err);
        }
        else {
            resolve(res.toJSON());
        }
    });
});
const readAndPopulate = (testfile, context = { vars: (_p) => '' }) => {
    const rendered = ejs_1.default.render(fs_1.default.readFileSync(testfile).toString(), context);
    return js_yaml_1.default.safeLoad(rendered);
};
const supertestResultToRollingResult = (result) => ({
    headers: result.header,
    status: result.status,
    body: result.text,
    json: result.header['content-type'].match(/json/)
        ? JSON.parse(result.text)
        : {}
});
const runRequests = (testfile, app, opts) => __awaiter(this, void 0, void 0, function* () {
    // render requests with nothing that we know in terms of vars.
    // first request must not have vars on it
    let requests = readAndPopulate(testfile);
    // capture each successive call's results
    const rollingresults = {};
    for (let i = 0; i < requests.length; i += 1) {
        const currentRequest = requests[i];
        if (opts.announce) {
            opts.announce(currentRequest);
        }
        // eslint-disable-next-line
        const result = yield requestWithSupertest(currentRequest, supertest_1.default(app));
        opts
            .expect(opts.scrubResult(result))
            .toMatchSnapshot(opts.formatTitle(testfile, currentRequest));
        // prepare round for the next request, with the results of the current one.
        // populate the rolling result:
        rollingresults[currentRequest.id] = supertestResultToRollingResult(result);
        // re-render the entire requests file, with our added knowledge about the
        // universe. re-sets the 'vars' function so that it is aware of the new data.
        // this way the previous request's results are available to the next request's
        // descriptor to use as <%= vars('req-id.bar.baz') %>
        requests = readAndPopulate(testfile, {
            vars: p => lodash_1.default.get(rollingresults, p.split('.'), '')
        });
    }
});
const hypertest = (createApp, opts = {}) => (folder) => __awaiter(this, void 0, void 0, function* () {
    const mergedOpts = Object.assign({}, defaultOpts, opts);
    if (opts.expect) {
        opts.expect.addSnapshotSerializer({
            test(value) {
                return (value &&
                    value.req &&
                    value.req.headers &&
                    value.req.headers['user-agent'].match(/node-superagent/));
            },
            print: mergedOpts.serializer
        });
    }
    const suites = fs_1.default
        .readdirSync(folder)
        .filter(f => f.match(/\.yaml$/))
        .map(f => path_1.default.join(folder, f));
    // eslint-disable-next-line
    for (const testfile of suites) {
        // eslint-disable-next-line
        const { app, closeApp } = yield createApp();
        // eslint-disable-next-line
        yield runRequests(testfile, app, mergedOpts);
        // eslint-disable-next-line
        yield closeApp();
    }
});
exports.default = hypertest;
//# sourceMappingURL=index.js.map