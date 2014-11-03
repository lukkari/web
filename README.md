# LUKKARI

School schedule representer. Currently aimed to ICT-building of TUAS.

*(work in progress)*

Complete description and installation instuctions could be found in [project wiki](https://github.com/zaynetro/lukkari/wiki).

Brief description is provided below.

## Requirements

1. Node.js v0.10.x
2. MongoDB


## Install

### Clone project

1. `git clone https://github.com/zaynetro/lukkari.git`
2. `cd lukkari`
3. `npm istall`

### Build project

**Note:** you need gulp to build project. To install gulp type: `npm install -g gulp`

1. `gulp jade`
2. `gulp templates`

For development:

1. `gulp scripts`

For production:

1. `gulp min-js`
2. `gulp min-css`

[List of all gulp tasks](https://github.com/zaynetro/lukkari/wiki/Gulp-tasks)

### Configure envrironments

1. Setup `MONGODB_URI` *(uri to mongo database)* **REQUIRED**
2. Specify port number `PORT` *if needed (default: 8000)*
3. For production: `NODE_ENV=production`


## Run

### Development

**NOTE:** Don't forget to set up `MONGODB_URI`

* `bin/server`

### Production

* `nohup bin/forever > logs/server.log &`
