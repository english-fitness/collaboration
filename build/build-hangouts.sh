#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
now="$(date +'%Y%m%d%H%M%S')"

js="../public/built/hangouts-$now.js"

rm ../public/built/hangouts-*

node ../node_modules/requirejs/bin/r.js -o build-hangouts.js out=$js