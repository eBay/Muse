import mockedRoles from './mock.js';

const initialState = {
  roles: mockedRoles,
};
let idSeed = mockedRoles.length + 1;
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'new-role': {
      // Creating a new role
      return {
        ...state,
        roles: [
          ...state.roles,
          {
            ...action.payload,
            id: idSeed++,
          },
        ],
      };
    }
    case 'update-role': {
      // Update role
      const newRoles = [...state.roles];
      const roleIndex = newRoles.findIndex(u => u.id === action.payload.id);
      newRoles[roleIndex] = {
        ...newRoles[roleIndex],
        ...action.payload,
      };

      return {
        ...state,
        roles: newRoles,
      };
    }
    default:
      break;
  }
  return state;
};
export default reducer;
