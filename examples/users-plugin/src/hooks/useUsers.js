import { useQuery } from '@tanstack/react-query';
import apiClient from '../api';

const USERS_URL = "https://cors-anywhere.herokuapp.com/https://buluu97.github.io/muse-next-database/mock/users.json";

function getUsersFromLocal() {
  const local = localStorage.getItem('users');
  return local ? JSON.parse(local) : null;
}

function saveUsersToLocal(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

export default function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiClient.get(USERS_URL);
      const remoteUsers = res.data || [];
      const localUsers = getUsersFromLocal() || [];
      const merged = [
        ...remoteUsers.map(remoteUser => {
          const local = localUsers.find(localUser => String(localUser.id) === String(remoteUser.id));
          return local ? { ...remoteUser, ...local } : remoteUser;
        }),
        ...localUsers.filter(
          localUser => !remoteUsers.some(remoteUser => String(remoteUser.id) === String(localUser.id))
        ),
      ];
      saveUsersToLocal(merged);
      return merged;
    },
  });
}