import { $ } from 'zx';

await $`docker run \
  -it \
  -p 127.0.0.1:5000-7000:5000-7000 \
  muse-demo`;
