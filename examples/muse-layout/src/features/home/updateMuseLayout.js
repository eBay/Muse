import store from '@ebay/muse-react/src/common/store';

export default () => {
  store.dispatch({
    type: 'MUSE_LAYOUT$HOME_UPDATE_MUSE_LAYOUT',
  });
};
