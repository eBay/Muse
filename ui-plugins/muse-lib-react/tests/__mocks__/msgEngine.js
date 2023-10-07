// Message engine is used to communicate between main app and sub app via postMessage
const makeId = () => Math.random().toString(36).substring(2);

const msgEngine = {
  listeners: {},
  promises: {},
  iframes: {},
  register(key, iframe) {
    this.iframes[key] = iframe;
  },
  unregister(key) {
    delete this.iframes[key];
  },
  getIframe(iframe) {
    if (typeof iframe === 'string') return this.iframes[iframe];
    return iframe;
  },
  init() {
    window.addEventListener(
      'message',
      (msg) => {
        if (msg?.data?.type !== 'muse') return;
        console.log('on muse post msg: ', msg);
        if (msg?.data?.payload?.promiseId) {
          this.resolvePromise(msg.data.payload.promiseId, msg?.data.payload?.data);
        }
        Object.entries(this.listeners).forEach(([id, func]) => {
          try {
            func(msg.data.payload, msg);
          } catch (err) {
            console.log(`Warning: failed to process message "${id}"`, msg, err);
          }
        });
      },
      false,
    );
  },
  resolve(promiseId, payload) {
    // Todo: send
  },
  // a component could listen messages from other apps
  addListener(id, callback) {
    this.listeners[id] = callback;
  },
  removeListener(id) {
    delete this.listeners[id];
  },
  sendToChild(msg, iframe, isPromise = false) {
    let promise = null;
    let promiseHandler = null;
    let id = null;
    if (isPromise) {
      id = makeId();
      promise = new Promise((resolve, reject) => {
        promiseHandler = this.promises[id] = { resolve, reject };
      });
    }
    try {
      this.getIframe(iframe)?.contentWindow?.postMessage(
        {
          type: 'muse',
          promiseId: id,
          from: {
            app: window.MUSE_GLOBAL.appName,
            env: window.MUSE_GLOBAL.envName,
            clientKey: 'parent',
          },
          payload: msg,
        },
        '*',
      );
    } catch (err) {
      console.log(`Failed to post message to child: `, msg);
      if (promise) promiseHandler.reject(err);
    }
    return promise;
  },

  sendToParent(msg, isPromise = false) {
    let promise = null;
    let promiseHandler = null;
    let id = null;
    if (isPromise) {
      id = makeId();
      promise = new Promise((resolve, reject) => {
        promiseHandler = this.promises[id] = { resolve, reject };
      });
    }
    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage(
          {
            type: 'muse',
            from: {
              app: window.MUSE_GLOBAL.appName,
              env: window.MUSE_GLOBAL.envName,
              type: 'child',
            },
            payload: msg,
          },
          '*',
        );
      } catch (err) {
        console.log('Failed to send message to parent: ', msg);
        if (promise) promiseHandler.reject(err);
      }
    }
    return promise;
  },

  // assert the app in iframe is a muse app
  assertMuseApp(iframe) {
    return new Promise((resolve, reject) => {
      this.sendToChild({ type: 'assert-muse-app' }, this.getIframe(iframe), true).then(resolve);
      setTimeout(() => reject(new Error('Muse app check timeout.')), 300); // if no response in 300ms (normally 30ms), it means it's not a Muse app.
    });
  },

  resolvePromise(promiseId, payload) {
    this.promises[promiseId]?.resolve(payload);
    delete this.promises[promiseId];
  },
  resolveParent(promiseId, payload) {
    msgEngine.sendToParent({ promiseId: promiseId, data: payload });
  },
  resolveChild(iframe, promiseId, payload) {
    // TODO: sendToParent promise support
  },
};

msgEngine.init();

// Assert a client is a Muse app
msgEngine.addListener('handle-muse-app-check', (payload, msg) => {
  if (payload?.type === 'assert-muse-app' && msg.data?.from?.clientKey === 'parent') {
    // Tell parent I'm a Muse app.
    msgEngine.resolveParent(msg?.data?.promiseId, {
      app: window.MUSE_GLOBAL.app.name,
      env: window.MUSE_GLOBAL.env.name,
    });
  }
});

window.MUSE_GLOBAL.app = { name : "test" };
window.MUSE_GLOBAL.env = { name : "staging" };
window.MUSE_GLOBAL.msgEngine = msgEngine;
