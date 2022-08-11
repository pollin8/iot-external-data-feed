#! /bin/sh -v

# Exit on any errors
set -e

ROOT=$PWD
CURRENT_TIME=$(date "+%Y-%m-%d-%s")
TARGET="${PWD}/build/"
SRC="${PWD}/dist"

rm -fr $TARGET

# Delete if exits
find . -wholename "$ARCHIVE_FILE" -delete
mkdir -p $TARGET
cp -u -r $SRC  $TARGET
cp -u ./package.json $TARGET
cp -u ./host.json $TARGET
cp -u ./LICENSE $TARGET
find . -name 'function.json' -not -path "./build/*"  -exec cp --parents {} $TARGET ';'

for val in $REMOVE; do
    rm -rf -- "${TARGET}${val}"
    rm -rf -- "${TARGET}dist/${val}"
    echo 'Removed ' "${TARGET}${val}" and "${TARGET}dist/${val}"
done


cd $TARGET

find . -name '*js.map' -not -path './node_modules/*' -delete
find . -name '*.test.js' -not -path './node_modules/*' -delete
find . -name '*.config.js' -not -path './node_modules/*' -delete
npm install --only=prod



cd ..