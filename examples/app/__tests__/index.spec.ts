import path from 'path'
import hypertest from '../../../src/index'
import app from '../index'

const test = hypertest(() => Promise.resolve({ app, closeApp: () => {} }), {
  expect
})
describe('app', () => {
  it('hypertest', async () => {
    await test(path.join(__dirname, 'requests'))
  })
})
