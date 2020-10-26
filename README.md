<h1 align="center">Welcome to Auction Project 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <a href="https://twitter.com/prettydevman" target="_blank">
    <img alt="Twitter: prettydevman" src="https://img.shields.io/twitter/follow/prettydevman.svg?style=social" />
  </a>
</p>

## Description

Auction API Server

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

---

### remove git cache and make works gitignore

git rm --cached node_modules -r

---

### memos

#### cloudamqp

https://api.cloudamqp.com/console/b864c608-ec13-401c-a555-e048bc06c314/details

---

### warning

some products don't have the buybox_winner fileds. so you need to filter when import the products from amazon.

### codeship url

https://app.codeship.com/projects/538f1c90-b13f-0138-3f36-7a26eef27f64

### bugs

> (node:16392) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 exhibitUpdated listeners added to [EventEmitter]. Use emitter.setMaxListeners() to increase limit

- it's related node.js version.

### facebook user access token for 60days(generated 09/21/2020)

1. first, generate short lived token here.

https://developers.facebook.com/tools/explorer/

2. second, generate long lived token from the short lived token here.

https://developers.facebook.com/docs/pages/access-tokens/

### twillo account

twilio account created: ACfcbe92d1ab0b824d28421a7b41c3e168
auth token: bbfc6fc4ff171418e65c2a780e30add1
