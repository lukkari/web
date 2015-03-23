# LUKKARI

School schedule representer. Currently aimed to ICT-building of TUAS.

*(work in progress)*

Complete description and installation instuctions could be found in [project wiki](https://github.com/zaynetro/lukkari/wiki).

Mobile application can be accessed here [DenisAnchugov/Schedule](https://github.com/DenisAnchugov/Schedule).

----

Brief description is provided below.

## Requirements

1. Node.js v0.10.x
2. MongoDB


## Install

### Clone project

1. `git clone https://github.com/zaynetro/lukkari.git`
2. `cd lukkari`
3. `npm install`

### Build project

* For testing `npm run gulp scripts`
* For production: `npm run build`

[List of all tasks](https://github.com/zaynetro/lukkari/wiki/Build-tasks)

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

## License

MIT
