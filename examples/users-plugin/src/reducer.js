import mockedUsers from './mock.js';

const initialState = {
  users: mockedUsers,
};

let idSeed = mockedUsers.length + 1;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'new-user': {
      // Creating a new user
      return {
        ...state,
        users: [
          ...state.users,
          {
            ...action.payload,
            id: idSeed++,
          },
        ],
      };
    }
    case 'update-user':
      const newUsers = [...state.users];
      const userIndex = newUsers.findIndex(u => u.id === action.payload.id);
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
