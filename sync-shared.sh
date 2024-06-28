rm -rf chrome/shared/{iconsscripts,static_rules.json,sw.js} && cp -r shared/{icons,scripts,static_rules.json,sw.js} chrome/
rm -rf firefox/shared/{iconsscripts,static_rules.json,sw.js} && cp -r shared/{icons,scripts,static_rules.json,sw.js} firefox/
rm -rf local/shared/{icons,scripts,static_rules.json,sw.js} && cp -r shared/{icons,scripts,static_rules.json,sw.js} local/