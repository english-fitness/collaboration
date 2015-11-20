#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
now="$(date +'%Y%m%d%H%M%S')"

css="../public/built/main-$now.css"

rm ../public/built/main-*.sh

node ../node_modules/requirejs/bin/r.js -o build-css.js out=$css
