#!/bin/bash
# Copyright 2023 Marc-Antoine Ruel. All rights reserved.
# Use of this source code is governed under the Apache License, Version 2.0
# that can be found in the LICENSE file.

set -eu

if [ -f are_you_there_hass.zip ]; then
  rm are_you_there_hass.zip
fi
zip -9 are_you_there_hass.zip \
  background.js \
  common.js \
  eye-lock-open-outline-128.png \
  manifest.json \
  options.css \
  options.html \
  options.js
