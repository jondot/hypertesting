import request from 'supertest'
import yaml from 'js-yaml'
import path from 'path'
import fs from 'fs'
import ejs from 'ejs'
import L from 'lodash'

interface Context {
  vars: (p: string) => string
}

export type CreateAppAsyncFn = () => Promise<{
  app: any
  closeApp: () => void
}>

export interface RequestInfo {
  id: string
  path: string
  method: string
  desc: string
  body?: any
  headers?: any
  query?: any
}

export interface ResultInfo {
  header?: any
  status?: number
  text?: string
  req: {
    data?: any
    headers?: any
    method: string
    url: string
  }
}
export interface HypertestDefinedOpts {
  scrubResult: (result: ResultInfo) => ResultInfo
  formatTitle: (testfile: string, currentRequest: RequestInfo) => string
  serializer: (
    value: ResultInfo,
    serialize: Function,
    indent: Function
  ) => string
  announce: (currentRequest: RequestInfo) => void
  expect: any
}

export interface HypertestOpts {
  scrubResult?: (result: ResultInfo) => ResultInfo
  formatTitle?: (testfile: string, currentRequest: RequestInfo) => string
  serializer?: (
    value: ResultInfo,
    serialize: Function,
    indent: Function
  ) => string
  announce?: (currentRequest: RequestInfo) => void
  expect?: any
}

const defaultScrubber = (result: ResultInfo): ResultInfo => {
  if (result.header.date) {
    // eslint-disable-next-line
    result.header.date = 'scrubbed'
  }
  if (result.header.etag) {
    // eslint-disable-next-line
    result.header.etag = 'scrubbed'
  }
  return result
}

const defaultOpts: HypertestDefinedOpts = {
  scrubResult: defaultScrubber,
  formatTitle: (testfile: string, currentRequest: RequestInfo) =>
    `${path.join(...L.takeRight(testfile.split(path.sep) as string[], 2))} ${
      currentRequest.id
    }: ${currentRequest.desc}`,

  serializer: (value: ResultInfo, serialize: Function, indent: Function) => {
    const {
      req: { method, url }
    } = value
    return [
      `  ${method} ${url.replace(/127\.0\.0\.1:\d+/, 'test-service')}\n`,
      indent(
        serialize({
          request: { body: value.req.data, headers: value.req.headers },
          response: {
            headers: value.header,
            status: value.status,
            body: value.text
          }
        })
      )
    ].join('\n')
  },
  announce: (currentRequest: RequestInfo) => console.log('hypertest request', currentRequest), // eslint-disable-line
  expect: null
}

const requestWithSupertest = (requestInfo: RequestInfo, req: any) =>
  new Promise((resolve, reject) => {
    req[requestInfo.method.toLowerCase()](requestInfo.path)
      .send(requestInfo.body)
      .set(requestInfo.headers || {})
      .set(requestInfo.query || {})
      .end((err: any, res: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(res.toJSON())
        }
      })
  })

const readAndPopulate = (
  testfile: string,
  context: Context = { vars: (_p: string) => '' }
) => {
  const rendered = ejs.render(fs.readFileSync(testfile).toString(), context)
  return yaml.safeLoad(rendered)
}
const supertestResultToRollingResult = (result: any) => ({
  headers: result.header,
  status: result.status,
  body: result.text,
  json: result.header['content-type'].match(/json/)
    ? JSON.parse(result.text)
    : {}
})

const runRequests = async (
  testfile: string,
  app: any,
  opts: HypertestDefinedOpts
) => {
  // render requests with nothing that we know in terms of vars.
  // first request must not have vars on it
  let requests = readAndPopulate(testfile)

  // capture each successive call's results
  const rollingresults: any = {}

  for (let i = 0; i < requests.length; i += 1) {
    const currentRequest = requests[i]

    if (opts.announce) {
      opts.announce(currentRequest)
    }
    // eslint-disable-next-line
    const result = await requestWithSupertest(currentRequest, request(app))
    opts
      .expect(opts.scrubResult(result as ResultInfo))
      .toMatchSnapshot(opts.formatTitle(testfile, currentRequest))

    // prepare round for the next request, with the results of the current one.
    // populate the rolling result:
    rollingresults[currentRequest.id] = supertestResultToRollingResult(result)

    // re-render the entire requests file, with our added knowledge about the
    // universe. re-sets the 'vars' function so that it is aware of the new data.
    // this way the previous request's results are available to the next request's
    // descriptor to use as <%= vars('req-id.bar.baz') %>
    requests = readAndPopulate(testfile, {
      vars: p => L.get(rollingresults, p.split('.'), '')
    })
  }
}

const hypertest = (
  createApp: CreateAppAsyncFn,
  opts: HypertestOpts = {}
) => async (folder: string) => {
  const mergedOpts: HypertestDefinedOpts = { ...defaultOpts, ...opts }
  if (opts.expect) {
    opts.expect.addSnapshotSerializer({
      test(value: ResultInfo) {
        return (
          value &&
          value.req &&
          value.req.headers &&
          value.req.headers['user-agent'].match(/node-superagent/)
        )
      },
      print: mergedOpts.serializer
    })
  }
  const suites = fs
    .readdirSync(folder)
    .filter(f => f.match(/\.yaml$/))
    .map(f => path.join(folder, f))
  // eslint-disable-next-line
  for (const testfile of suites) {
    // eslint-disable-next-line
    const { app, closeApp } = await createApp()
    // eslint-disable-next-line
    await runRequests(testfile, app, mergedOpts)
    // eslint-disable-next-line
    await closeApp()
  }
}

export { defaultOpts, defaultScrubber }
export default hypertest
