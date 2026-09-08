function isSafeHref(href) {
  if (!href || href === '#') return true;
  try {
    const url = new URL(href, window.location.origin);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

const error = {
  errors: [],
  init() {
    const errorDiv = document.createElement('div');
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
    this.mountNode.replaceChildren();

    const inner = document.createElement('div');
    inner.className = 'muse-error-node-inner';

    const heading = document.createElement('h4');
    heading.textContent = 'Failed to load:';
    inner.appendChild(heading);

    if (this.errors.length === 1) {
      const div = document.createElement('div');
      div.textContent = String(this.errors[0] ?? '');
      inner.appendChild(div);
    } else {
      const ul = document.createElement('ul');
      this.errors.forEach((err) => {
        const li = document.createElement('li');
        li.textContent = String(err ?? '');
        ul.appendChild(li);
      });
      inner.appendChild(ul);
    }

    const note = document.createElement('p');
    note.appendChild(
      document.createTextNode('* Unexpected error happened, please refresh to retry or '),
    );
    const supportLink = window.MUSE_GLOBAL?.appConfig?.supportLink || '#';
    const contact = document.createElement('a');
    contact.textContent = 'contact support';
    contact.href = isSafeHref(supportLink) ? supportLink : '#';
    note.appendChild(contact);
    note.appendChild(document.createTextNode('.'));
    inner.appendChild(note);

    this.mountNode.appendChild(inner);
  },
};

export default error;
