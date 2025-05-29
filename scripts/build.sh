#!/usr/bin/env bash

# fail fast if any command fails
set -eux

cd ./workspace || exit

# Check if application name and stage are provided
if [ "$1" = "" ] || [ "$2" = "" ]; then
  echo "Error: Application name or stage not provided."
  echo "Usage: $0 <stage> <application-name>"
  exit 1
fi

STAGE=$1
BUILD_DIR="../deployment/aws/.build/$STAGE"

IFS=',' read -ra APP_NAMES <<<"$2"

echo "Cleaning up previous build directories..."
rm -rf ./dist
for APP_NAME in "${APP_NAMES[@]}"; do
  # Clean up the previous build directory if it exists
  if [ -d "$BUILD_DIR/$APP_NAME" ]; then
    echo "Removing $BUILD_DIR/$APP_NAME..."
    rm -rf "${BUILD_DIR:?}/$APP_NAME"
  fi
done

# Create the build directory if it doesn't exist
mkdir -p "$BUILD_DIR"

# Run the Nx build command for the specified application and check its exit status
npx nx run-many \
  --target=build \
  --projects="$2" \
  --configuration="$STAGE" \
  --output-style="static" \
  --skipNxCache \
  --parallel

mv ./dist/apps/* "$BUILD_DIR"
