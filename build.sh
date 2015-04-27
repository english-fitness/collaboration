#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
now="$(date +'%Y%m%d%H%M%S')"

js="./public/built/main-$now.js"
css="./public/built/main-$now.css"

rm public/built/*.*

node node_modules/requirejs/bin/r.js -o build.js out=$js
node node_modules/requirejs/bin/r.js -o build-css.js out=$css
