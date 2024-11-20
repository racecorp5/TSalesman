#!/bin/sh
if [ "$(uname)" = "Darwin" ]; then
  # macOS
  sed -i '' "s/GMAPS_API_KEY/${GMAPS_API_KEY}/g" ./src/index.html
else
  # Linux
  sed -i "s/GMAPS_API_KEY/${GMAPS_API_KEY}/g" ./src/index.html
fi