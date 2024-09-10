import { $ } from 'zx';

$.verbose = true;

const cwd = process.cwd();

await $`docker build -t muse-tests .`;
await $`docker run -it -v ${cwd}/tmp:/testspace/tmp -p 127.0.0.1:5000-7000:5000-7000 muse-tests`;
