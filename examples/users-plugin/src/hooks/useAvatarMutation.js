import { useMutation, useQueryClient } from '@tanstack/react-query';

function getUsersFromLocal() {
  const local = localStorage.getItem('users');
  return local ? JSON.parse(local) : [];
}

function saveUsersToLocal(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

export function useAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, avatar }) => {
      const users = getUsersFromLocal();
      const idx = users.findIndex(u => String(u.id) === String(id));
      if (idx !== -1) {
        users[idx] = { ...users[idx], avatar };
        saveUsersToLocal(users);
      }
      return users[idx];
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['users']);
      if (variables && variables.id) {
        queryClient.invalidateQueries(['userDetail', String(variables.id)]);
      }
    },
  });
}