/*
  General polling utility for nodejs app.
  It save last result in polling instance and allow to set exires time so that if keep failing the last successful result will be deleted.

  - task: the task function returns a promise
  - interval: milliseconds of the gap between tasks
  - expires: How long in milliseconds the last result will be deleted, set it to 0 if never expires
  - retries: how many continuous failures to stop polling, set it to 0 if never stop
  - stopIf: the callback to check if stop polling when result matches some condition
*/
export default function({
  task,
  interval = 3000,
  expires = 60000,
  converter,
  retries = 30,
  stopIf,
}) {
  const poller = {
    remaining: retries > 0 ? retries : 1,
    stopped: false,
    p: null,
    execute() {
      const timestamp = this.startTime;
      this.promise = task()
        .then(res => {
          // If re-started, discard previous response
          if (this.startTime !== timestamp) return;
          this.value = converter ? converter(res) : res;
          this.remaining = retries > 0 ? retries : 1;
          this.timestamp = Date.now();
          delete this.error;
          delete this.errorTimestamp;
          delete this.promise;

          if (stopIf && stopIf(res)) {
            this.stopped = true;
          }

          if (!this.stopped) {
            this.p = setTimeout(this.execute.bind(this), interval);
          }
          return res;
        })
        .catch(err => {
          if (this.startTime !== timestamp) return;

          this.error = err;
          this.errorTimestamp = Date.now();
          if (expires > 0 && this.timestamp && Date.now() - this.timestamp > expires) {
            delete this.value;
            delete this.timestamp;
          }
          if (retries > 0) {
            this.remaining--;
          }
          delete this.promise;
          if (!this.stopped && this.remaining > 0) {
            this.p = setTimeout(this.execute.bind(this), interval);
          }
        });
      return this.promise;
    },
    restart() {
      this.stop();
      return this.start();
    },

    start() {
      this.stopped = false;
      this.startTime = Date.now();
      return this.execute();
    },
    stop() {
      if (this.p) clearTimeout(this.p);
      this.stopped = true;
      delete this.value;
      delete this.timestamp;
      delete this.error;
      delete this.errorTimestamp;
    },
  };
  poller.start();
  Object.assign(this || {}, poller);
  return poller;
}
