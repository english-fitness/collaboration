#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
now="$(date +'%Y%m%d%H%M%S')"

js="./public/built/main-$now.js"
hangoutjs="./public/built/hangouts-$now.js"
css="./public/built/main-$now.css"

rm public/built/*

node node_modules/requirejs/bin/r.js -o build/build.js out=$js
node node_modules/requirejs/bin/r.js -o build/build-css.js out=$css
node node_modules/requirejs/bin/r.js -o build/build-hangouts.js out=$hangoutjs