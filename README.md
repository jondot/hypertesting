![](media/cover.png)

# Hypertesting

A declarative and contextual contract-driven testing framework for your API.


✅ Use `integration` to compose an first-class [hypercontroller](https://github.com/jondot/hypercontroller) and [TypeORM](https://typeorm.io) based integration testing experience   
✅ Use `yaml` to describe your end-to-end acceptance tests stories  
✅ Write contextual acceptance tests without code - access previous request results, add custom scripts and generate test blocks in your YAML.  
✅ Powered by [Jest](https://jestjs.io), [supertest](https://github.com/visionmedia/supertest) and Snapshot driven testing  
✅ Custom response scrubbing for secrets and sensitive data  
✅ Run as a standalone binary with `hytest`  


## Quick Start

Install:

```
$ yarn add --dev hypertesting
```


## Acceptance Tests

In this way, you can use Hypertesting in any project, including projects that are not related to Node.js. 

Write your testing story (`requests/api.yaml`):

```yaml
- id: my-first-request
  desc: just a normal GET request
  method: get
  path: /
```

If you want to scrub sensitive data or remove unstable snapshot results (things that change between runs, such as dates):


```yaml
- id: my-first-request
  desc: just a normal GET request
  method: get
  path: /
  scrub:
  - header.connection
```

In any case hypertesting comes with default scrubbing logic, and this addition would be on top of it.

Now create a Jest spec and point it to your yaml file. In addition you need to specify how to open and close your app.


Here's an example using an Express `app`:

```js
import path from 'path'
import hypertesting from 'hypertesting'
import app from '../index'

const test = hypertesting(() => Promise.resolve({ 
    app, 
    closeApp: () => {} 
}))
describe('app', () => {
  it('hypertest', async () => {
    await test(path.join(__dirname, 'requests'))
  })
})
```

You should have your expected results in `__snapshots__`. Use Jest as you would for other types of tests to update, verify and run tests:

```
$ yarn jest
```

To see this in action you can run the tests in [examples/app]:

```
$ cd examples/app
$ yarn && yarn test
```



### White Box Testing


In the example above we're testing an Express app, and we're telling hypertesting about how we create and close such an app and it will create one for us for each test cycle:

```js
() => Promise.resolve({ 
    app, 
    closeApp: () => {} 
})
```

In the same sense we can prepare a database and clean it up, set up other services, configuration and so on.

### Black Box Testing

To use hypertesting in a black-box scenario, point `app` to a URL:

```
const test = hypertesting(() => Promise.resolve({ 
    app: 'http://localhost:3000', 
    closeApp: () => {} 
}))
```

In this case, again, we have nothing special to do in order to close an app. Since this still runs within the scope of your Jest specs, you can build set up and tear down code as you would otherwise.


### Parameter Passing

By default, hypertesting capture the current call's results and passes it to the next call as context. Here's how it looks like when you want to reuse data from previous calls.

Here's a common case where we have to have a JWT token before being able to access a service endpoint. 

We log in, get a JWT token and use it in the next request.

```yaml
- id: login_1
  desc: Login to the service successfully
  path: /auth/login
  method: post
  body:
    username: jondot@gmail.com
    password: world
- id: see-account
  desc: see account with token from login
  path: /account
  method: get
  headers:
    authorization: bearer <%= vars('login_1.json.token') %>
```

Under the hood, all `yaml` files are actually [EJS](https://ejs.co) (embedded Javascript) template files as well, meaning you can apply any logic, variables, or Javascript code directly into the `yaml` request stories!

```yaml
- id: see-account
  desc: see account with token from login
  path: /account
  method: get
  headers:
    authorization: bearer <%= vars('login_1.json.token') %>
```

What you see here is that every `yaml` file is interpolated progressivly. That is, a request is being made, and the `yaml` file is re-rendered internally for each request with the previous requests results.

Accessing results is done with the `vars` function:

```
<%= vars('login_1.json.token') %>
```

And more generally:


```
<%= vars('[previous-request-id].[response object]') %>
```

Where `response object` is your regular [supertest](https://github.com/visionmedia/supertest) response. So you can pick headers, body, status code and even the original request.

### Standalone

To start quickly or in a production environment that doesn't include Node.js, you can use Hypertesting without Node.js, or the `hypertesting` library.

First, get a copy of [hytest from the Releases section](https://github.com/jondot/hypertesting/releases).

Then, write your test story in `api.yaml` and use a driving script:

```js
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

```

Then run:

```
$ ls examples/stand-alone
requests/
requests.js

$ cd examples/stand-alone && hytest requests.js
```

To run this example, check out [examples/stand-alone](examples/stand-alone).








## Fullstack Integration Tests

If you use [hypercontroller](https://github.com/jondot/hypercontroller) and [TypeORM](https://typeorm.io) then Hypertesting is optimized to give you a first class API testing experience. 


It should look like this:

```js
import createServer from '../../server'
import { stack: { integration } } from 'hypertesting'

const scrubPaths = [
  'header.date',
  'header.etag',
  'req.url',
  'req.headers.authorization',
  { path: 'text', regex: /"id":.*,/, filler: '"id":"scrubbed",' }
]
const req = integration(
  createServer,  // a hypercontroller friendly createServer
  scrubPaths, // see above
  'users.yaml' // database fixture, loaded before each test
)

describe('account', () => {
  req('should forbid access without a token', async (request, snapshot) => {
    snapshot(await request.get('/account'))
  })
})
```

And `createServer` simply returns a Hypercontroller server:

```js
const createServer = () =>
  server
    .start(createConnection)
    .then(({ opts }) => console.log(`Listening on ${opts.port}`))
)
```

## Scrubber

You can use hypertesting's scrubber for anything you like without having to use the whole thing:

```js
import { scrubber } from 'hypertesting'

const scrub = scrubber([
  'header.x-site'
])

it("should make a request", async ()=>{
  expect(scrub(await request("/foo/bar"))).toMatchSnapshot()
})
```




# Contributing

Fork, implement, add tests, pull request, get my everlasting thanks and a respectable place here :).

### Thanks:

To all [Contributors](https://github.com/jondot/hypertesting/graphs/contributors) - you make this happen, thanks!

# Copyright

Copyright (c) 2019 [@jondot](http://twitter.com/jondot). See [LICENSE](LICENSE.txt) for further details.
