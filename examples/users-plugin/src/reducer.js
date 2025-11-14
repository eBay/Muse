const initialState = {
  users: [],
};

let idSeed = 1;

function saveUsersToLocal(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'set-users':
      idSeed = action.payload.reduce((max,u)=>Math.max(max,u.id),0)+1;
      saveUsersToLocal(action.payload);
      return {
        ...state,
        users: action.payload,
      };
    case 'new-user': {
      // Creating a new user
      const newUsers = [
        ...state.users,
        {...action.payload, id: idSeed++ },
      ];
      saveUsersToLocal(newUsers);
      return {
        ...state,
        users: newUsers,
      };
    }
    case 'update-user':
      const newUsers = [...state.users];
      const userIndex = newUsers.findIndex(u => u.id === action.payload.id);
      newUsers[userIndex] = {
        ...newUsers[userIndex],
        ...action.payload,
      };
      saveUsersToLocal(newUsers);
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
