#!/bin/bash
# Copyright 2023 Marc-Antoine Ruel. All rights reserved.
# Use of this source code is governed under the Apache License, Version 2.0
# that can be found in the LICENSE file.

# minify sources into ./packed/ to then zip this directory.

set -eu

cd "$(dirname $0)"

if ! which minify &> /dev/null; then
  echo "Didn't find minify, installing."
  go install github.com/tdewolff/minify/v2/cmd/minify@v2.12.4
fi

if [ -f are_you_there_hass.zip ]; then
  rm are_you_there_hass.zip
fi
if [ -d packed ]; then
  rm -rf packed
fi
mkdir packed

minify *.css *.html *.js *.json -o packed
# Assume the png files stored in git already went through pngcrush.
cp *.png packed
zip -9 -q -j are_you_there_hass.zip packed/*
rm -rf packed

# Display content to confirm it's valid. It sounds silly but I wasted 2 hours in
# the past because one file was missing from the zip.
unzip -l are_you_there_hass.zip
