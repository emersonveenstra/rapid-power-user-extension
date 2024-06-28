VERSION="0.1.0"
cd chrome/ && rm -rf _metadata && zip ../dist/chrome-${VERSION}.zip * && cd ../firefox/ && zip ../dist/firefox-${VERSION}.zip *