import { useMutation, useQueryClient } from '@tanstack/react-query';

function getUsersFromLocal() {
  const local = localStorage.getItem('users');
  return local ? JSON.parse(local) : [];
}

function saveUsersToLocal(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

export function useAddUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user) => {
      const users = getUsersFromLocal();
      const maxId = users.length ? Math.max(...users.map(u => Number(u.id))) : 0;
      const newUser = { ...user, id: maxId + 1 };
      const newUsers = [...users, newUser];
      saveUsersToLocal(newUsers);
      return newUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
}

export function useEditUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user) => {
      const users = getUsersFromLocal();
      const idx = users.findIndex(u => String(u.id) === String(user.id));
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...user };
        saveUsersToLocal(users);
      }
      return user;
    },
    onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(['users']);
  if (variables && variables.id) {
    queryClient.invalidateQueries(['userDetail', String(variables.id)]);
  }
},
  });
}