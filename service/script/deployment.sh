#! /bin/bash

# Exit on any errors
set -e

ROOT=$PWD
CURRENT_TIME=$(date "+%Y-%m-%d-%s")
TARGET="${PWD}/build/"
SRC="${PWD}/dist"
ZIP_CMD="7z a -tzip -mx3 -bd "
ARCHIVE_FILE="${PWD}/deployments/iot-external-data-feed-${CURRENT_TIME}.zip"

rm -fr $TARGET

# Delete if exits
find . -wholename "$ARCHIVE_FILE" -delete
mkdir -p $TARGET
cp -u -r $SRC  $TARGET
cp -u ./package.json $TARGET
cp -u ./host.json $TARGET
cp -u ./LICENSE $TARGET
find . -name 'function.json' -not -path "./build/*"  -exec cp --parents {} $TARGET ';'

pushd $TARGET

find . -name '*js.map' -not -path './node_modules/*' -delete
find . -name '*.test.js' -not -path './node_modules/*' -delete
find . -name '*.micro.js' -not -path './node_modules/*' -delete
find . -name '*.integration.js' -not -path './node_modules/*' -delete
find . -name '*.config.js' -not -path './node_modules/*' -delete
npm install --only=prod


# Zip unless SKIP_ZIP is false
if [[ -z "${SKIP_ZIP}" || "${SKIP_ZIP}" == "true" ]] ;
then
  echo "Zipping..."
  $ZIP_CMD $ARCHIVE_FILE *
else
  echo "Skipping zip."
fi

popd