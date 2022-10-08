import mockUsers from './mock.js';

const initialState = {
  users: mockUsers,
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'update-user':
      const newUsers = [...state.users];
      const userIndex = newUsers.findIndex(u => (u.id = action.payload.id));
      newUsers[userIndex] = {
        ...newUsers[userIndex],
        ...action.payload,
      };
      return {
        ...state,
        users: newUsers,
      };
    default:
      break;
  }
  return state;
};
export default reducer;
