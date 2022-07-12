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
    document.body.removeChild(this.mountNode);
    document.body.style.opacity = 0;
    setTimeout(() => {
      document.body.classList.add('loading-finish-transition');
      document.body.style.opacity = 1;
    }, 10);

    setTimeout(() => {
      document.body.classList.remove('loading-finish-transition');
    }, 1000);
  },

  showMessage(msg) {
    this.labelNode.innerHTML = msg || '';
  },
};
