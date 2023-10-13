import _ from 'lodash';
const MAX_OUTPUT_LINES = 1000;

const reducer = (state = {}, action) => {
  let newState;
  switch (action.type) {
    case 'MUSE_RUNNER_OUTPUT': {
      const newRunnerOutput = { ...state.runnerOutput };
      const msgs = _.castArray(action.payload);
      msgs.forEach((msg) => {
        const { id } = msg;
        let newOutput = [...(newRunnerOutput[id] || []), ...msg.output];
        if (newOutput.length >= MAX_OUTPUT_LINES) {
          newOutput = newOutput.slice(-MAX_OUTPUT_LINES);
        }
        newRunnerOutput[id] = newOutput;
      });

      newState = {
        ...state,
        runnerOutput: newRunnerOutput,
      };

      break;
    }
    case 'CLEAR_MUSE_RUNNER_OUTPUT': {
      const { id } = action.payload;
      const runnerOutput = { ...state.runnerOutput };
      delete runnerOutput[id];
      newState = {
        ...state,
        runnerOutput,
      };

      break;
    }

    case 'MUSE_RUNNER_INIT_DATA':
      newState = {
        ...state,
        ...action.payload,
      };
      break;
    case 'MUSE_RUNNER_SOCKET_CLOSED':
      newState = {
        ...state,
        socketClosed: true,
      };
      break;

    default:
      newState = state;
      break;
  }
  return newState;
};
export default reducer;
