![](media/cover.png)

# Hypertesting

A declarative and contextual contract-driven testing framework for your API.

✅ Use `yaml` to describe your end-to-end test stories  
✅ Powered by [Jest](https://jestjs.io), [supertest](https://github.com/visionmedia/supertest) and Snapshot driven testing  
✅ Contextual and scripted - access previous request results, add custom scripts and generate test blocks in your YAML.  


## Quick Start

Install:

```
$ yarn add --dev hypertesting
```

Write your testing story (`requests/api.yaml`):

```yaml
- id: my-first-request
  desc: just a normal GET request
  method: get
  path: /
```

And point your Jest spec to it. Here's an example using an Express `app`:

```js
import path from 'path'
import hypertesting from '../../../src/index'
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

## Overview

You can use hypertesting for black-box and white-box testing. In addition, it is declarative by nature -- the idea being that you write `yaml` stories to represent your acceptance tests, canary tests, or end-to-end tests and these can be written by a non-technical person.


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






# Contributing

Fork, implement, add tests, pull request, get my everlasting thanks and a respectable place here :).

### Thanks:

To all [Contributors](https://github.com/jondot/hypertesting/graphs/contributors) - you make this happen, thanks!

# Copyright

Copyright (c) 2019 [@jondot](http://twitter.com/jondot). See [LICENSE](LICENSE.txt) for further details.
