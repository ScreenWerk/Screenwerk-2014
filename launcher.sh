#! bin/bash
git fetch --tags
rev=`git rev-list --tags --max-count=1`
tag=`git describe --tags ${rev}`
git checkout --force ${tag}
npm update
nwjs
