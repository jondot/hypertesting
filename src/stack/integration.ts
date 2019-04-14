import supertest from 'supertest'
import scrubber, { ScrubEntry } from '../scrubber'
import fixture from './fixture'

const integration = (
  createServer: Function,
  scrubPaths: (string | ScrubEntry)[],
  fixturePath: string
) => (desc: string, fn: Function) => {
  const scrubRequest = scrubber(scrubPaths)
  const snapshot = (req: any) => expect(scrubRequest(req)).toMatchSnapshot()
  it(desc, async () => {
    const server = await createServer()
    if (server.connection) {
      await fixture(server.connection, fixturePath)
    }
    const request = supertest(server.app)
    await fn(request, snapshot)
    if (server.connection) {
      await server.connection.close()
    }
  })
}

export default integration
