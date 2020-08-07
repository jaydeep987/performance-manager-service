# :sparkles: performance-manager-service: The coding challenge
Service for performance manager ui. Part of coding challenge and independent component for whole app!

## Contents
- [About](#about)
- [Features & Technology stack](#features-technology-stack-used)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation and running](#installation-and-run-steps)
    - [Easy way!](#easy-way-using-docker)
    - [Little hard way!](#little-hard-way)
  - [Troubleshoot](#troubleshoot)
  - [Next steps](#next-steps)
- [My way of thinking & Assumptions](./docs/myway.md)
- [Specification (documentation of API)](./docs/specs.md)
- [Basic Database design](./docs/database.md)
- [UI Design and spec](https://github.com/jaydeep987/performance-manager-ui.git)

## About

Challenge is to build UI to allow users to manage review and feedback system. For the UI, need to manage data in backend, and
for that this is service provided to UI.

## Features (Technology stack used)

- Node.js restful api service using `express`
- Using `mongodb`, can configure either local or remote one
- Using *typescript* for better type safe code and great intellisense power. (pre-configured lint and rules)
- Configured with *tests*
- Cool logging feature included!
- Configured with Basic security like JWT authentication

## Getting started
To start using service and run in your local machine, there are several steps need to follow.

### Prerequisites
- node v10.13.0
- npm v6.4.1
- __mongodb v4.0.10__
- Mac or Ubuntu like linux

__Notes:__
- Need exact node version specified above
- Mongo db version 4.0 onwards is required otherwise *data fetch* won't work.
- Tested only in **Mac** mainly. In Ubuntu 18.04 roughly. **No guarantee about windows and other machines**

### Installation and run steps
1. Install node if not done yet. Recommended to use `nvm` to easily switch between versions
2. Install docker
  - In ubuntu may be `docker-compose` is not available directly. Use `sudo apt  install docker-compose` OR follow instructions [here](https://linuxize.com/post/how-to-install-and-use-docker-compose-on-ubuntu-18-04/).

*Clone* repo:
  - `git clone https://github.com/jaydeep987/performance-manager-service.git`
  - `cd performance-manager-service`

From here there are two ways: Easy/Simple or little hard way!

#### Easy way: Using docker!
Docker is already configured with this project and is easy to start with!

1. Build with `docker-compose build --no-cache`
2. Run with `docker-compose up -d`

__Sometimes `mongo` container takes *too* long time to start and it may timeout. In that case stop all containers and run `docker-compose up -d` again.__

It takes time, so wait for 1 minute and verify by checking log.

After successful start, verify by checking in postman or somewhere: `http://localhost:3200/users/`

You're done!

This will also add default user **admin** with password **123** in database.

#### Little hard way!

1. Install mongodb using
  - `docker pull mongo` and make it run by 
  - `docker run -d -p 27017:27017 mongo`
  - Make sure container is running : `docker ps`

2. Install dependencies:
  - `npm install`
  - `npm i -g typescript` if not done yet. It cause problem in some platform.
3. Start app:
  - `npm run dev`
  - Verify app should be running at `localhost:3200` and connection with `mongodb` should be established

    **Seed databse:**

    1. To seed database, and to start with you must seed it by adding at least one user!
      - Goto postman or any tool you like and send request:
      - *endpoint:* `http://localhost:3200/users/register`
      - *request body:* `x-www-form-urlencoded` and add following data:
        ```
        userName:admin
        password:123
        firstName:jay
        lastName:p
        sex:M
        role:admin
        ```
    2. Send the request and data should be inserted in db.
    3. OR, you can use any tool to verify like `Robo 3T`

Now service is running and endpoints are ready to use!

## Troubleshoot

Following above steps everything should be fine. But in case some environmental issue or possible bug and it fail try to debug and try possible solutions.

- In case connection to mongodb is not established after `npm run dev`, make sure docker container is running and *connection can be establisehd to it* There can be some network issue or issue because of proxy in your environment. (Should not be issue but still!)
- Access to other api endpoint is restricted. So you need to call *authentication* api and get token.
- If `nodemon` have some problem, try to install globally. `npm i -g nodemon`
- If have some issue in installing dependency, make sure node version should match.

Of course, contact me in case of any serious issue!

## Next step

Next step should be to [configure](https://github.com/jaydeep987/performance-manager-ui.git) **UI** (if you not done already) and start using app.
