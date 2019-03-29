const { hypertest } = require('/snapshot/hypertesting/dist')
const path = require('path')

const test = hypertest(
  () => Promise.resolve({ app: 'https://google.com', closeApp: () => {} }),
  {
    expect
  }
)
describe('app', () => {
  it('requests', async () => {
    await test(path.join(__dirname, 'requests'))
  })
})
