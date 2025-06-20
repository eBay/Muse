const error = {
  errors: [],
  init() {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = ``;
    errorDiv.id = 'muse-error-node';
    document.body.appendChild(errorDiv);
    this.mountNode = errorDiv;
  },
  showMessage(msg) {
    const arr = msg?.splice ? msg : [msg];
    this.errors.push(...arr);
    this.update();
  },
  update() {
    if (!this.mountNode) this.init();

    const content =
      this.errors.length === 1
        ? `<div>${this.errors[0]}</div>`
        : `<ul>
            ${this.errors.map((err) => '<li>' + err + '</li>').join('')}
          </ul>`;
    this.mountNode.innerHTML = `
      <div class="muse-error-node-inner">
        <h4>Failed to load:</h4>
        ${content}
        <p>* Unexpected error happened, please refresh to retry or <a href="${
          window.MUSE_GLOBAL.appConfig?.supportLink || '#'
        }">contact support</a>.</p>
      </div>
    `;
  },
};

export default error;
