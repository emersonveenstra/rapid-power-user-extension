VERSION="0.2.0"
cd chrome/ && rm -rf _metadata && zip -r ../dist/chrome-${VERSION}.zip * && cd ../firefox/ && zip -r ../dist/firefox-${VERSION}.zip *