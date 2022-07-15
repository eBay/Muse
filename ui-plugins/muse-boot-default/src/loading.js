import logo from './logo.png';

export default {
  init() {
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = `
    <div>
      <div class='muse-loading-node-inner'>
      <div class="loadingio-spinner-eclipse-p5fn84x4bh8"><div class="ldio-klconu2768"><div>
      </div></div></div>
      <img src="${logo}"/>
      </div>
      <label>Starting...</label>
    </div>
    `;
    loadingDiv.id = 'muse-loading-node';

    document.body.appendChild(loadingDiv);
    this.mountNode = loadingDiv;
    this.labelNode = loadingDiv.querySelector('label');
  },

  hide() {
    if (!this.mountNode) return;
    setTimeout(() => {
      this.mountNode.style.opacity = 0;
    }, 10);

    setTimeout(() => {
      document.body.removeChild(this.mountNode);
      delete this.mountNode;
    }, 800);

    delete this.labelNode;
  },

  showMessage(msg) {
    if (this.labelNode) this.labelNode.innerHTML = msg || '';
  },
};
