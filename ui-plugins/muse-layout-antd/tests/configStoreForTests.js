import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './rootReducerForTests';

// NOTE: Do not change middleares delaration pattern since rekit plugins may register middlewares to it.
const middlewares = [thunk];

function configureStore(initialState) {
  let devToolsExtension = f => f;
  const store = createStore(
    rootReducer(),
    initialState,
    compose(applyMiddleware(...middlewares), devToolsExtension),
  );
  return store;
}

export default configureStore;
