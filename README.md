# LUKKARI

Custom schedule of the ICT-building of TUAS

*(work in progress)*

## Install

### Clone project

1. `git clone https://github.com/zaynetro/lukkari.git`
2. `cd lukkari/app`
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

### Configure envrironments

1. Setup `MONGODB_URI` *(url to mongo database)*


## Run

`node app`


## Gulp tasks

#### `gulp jade`

Compile *.jade* files from `app/source/*/templates/` into *.html* files to `app/source/*/dist/`


#### `gulp templates`

Combine all *.html* files into one distributive file to work with browserify.

#### `gulp scripts`

Launch browserify on `app/source/*/*page.js`

#### `gulp min-js`

Launch browserify and uglify(minify js) on `app/source/*/*page.js`

#### `gulp min-css`

Minify css from `app/public/stylesheets/*.css` to `app/public/stylesheets/min/*.css`

#### `gulp watch`

Watch file changes and runs when file has been edited.

#### `gulp`

Runs `gulp scripts` and watch task `gulp watch` afterwards.
