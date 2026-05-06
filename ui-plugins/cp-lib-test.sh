#!/usr/bin/env bash

rm -rf ~/muse/muse-next/ui-plugins/muse-lib-antd/node_modules/@ebay/muse-lib-react/build/dev


cp -r ~/muse/muse-next/ui-plugins/muse-lib-react/build/dev ~/muse/muse-next/ui-plugins/muse-lib-antd/node_modules/@ebay/muse-lib-react/build/dev

cp -f ~/muse/muse-next/ui-plugins/muse-lib-react/build/dev/lib-manifest.json ~/muse/muse-next/ui-plugins/muse-lib-react/node_modules/.muse/dev/lib-manifest.json
cp -f ~/muse/muse-next/ui-plugins/muse-lib-antd/build/dev/lib-manifest.json ~/muse/muse-next/ui-plugins/muse-lib-antd/node_modules/.muse/dev/lib-manifest.json

echo "Done."