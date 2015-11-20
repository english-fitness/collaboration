#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
now="$(date +'%Y%m%d%H%M%S')"

js="../public/built/main-$now.js"

rm ../public/built/main-*.js

node ../node_modules/requirejs/bin/r.js -o build.js out=$js
