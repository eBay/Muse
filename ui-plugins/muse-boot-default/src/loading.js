import logo from './logo.png';

export default {
  init() {
    const { app, cdn } = window.MUSE_GLOBAL;
    const loadingDiv = document.createElement('div');
    const logoUrl = app.iconId
      ? `${cdn}/p/app-icon.${app.name}/v0.0.${app.iconId}/dist/icon.png`
      : logo;
    loadingDiv.innerHTML = `
    <div>
      <div class='muse-loading-node-inner'>
      <div class="loadingio-spinner-eclipse-p5fn84x4bh8"><div class="ldio-klconu2768"><div>
      </div></div></div>
      <img src="${logoUrl}"/>
      </div>
      <label>Starting...</label>
    </div>
    `;
    loadingDiv.id = 'muse-loading-node';
    if (app.config.theme === 'dark') {
      document.body.classList.add('muse-theme-dark');
    }
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
