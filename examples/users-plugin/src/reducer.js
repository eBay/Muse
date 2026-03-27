function loadRecentlyViewedFromLocal() {
  try {
    const saved = localStorage.getItem('recentlyViewedUsers');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load recently viewed users:', e);
    return [];
  }
}

function saveRecentlyViewedToLocal(recentlyViewed) {
  try {
    localStorage.setItem('recentlyViewedUsers', JSON.stringify(recentlyViewed));
  } catch (e) {
    console.error('Failed to save recently viewed users:', e);
  }
}

const initialState = {
  users: [],
  recentlyViewedUsers: loadRecentlyViewedFromLocal(),
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
    case 'add-recently-viewed': {
      const { id, name } = action.payload;
      const timestamp = Date.now();
      
      const filtered = state.recentlyViewedUsers.filter(u => u.id !== id);
      
      const updated = [
        { id, name, timestamp },
        ...filtered
      ].slice(0, 10);
      
      saveRecentlyViewedToLocal(updated);
      
      return {
        ...state,
        recentlyViewedUsers: updated,
      };
    }
    case 'clear-recently-viewed':
      saveRecentlyViewedToLocal([]);
      return {
        ...state,
        recentlyViewedUsers: [],
      };
    default:
      break;
  }
  return state;
};
export default reducer;
