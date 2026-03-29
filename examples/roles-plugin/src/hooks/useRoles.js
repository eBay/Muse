import { useQuery } from '@tanstack/react-query';
import apiClient from '../api';

const ROLES_URL = "https://cors-anywhere.herokuapp.com/https://lechang97.github.io/muse-next-database/mock/roles.json";

function getRolesFromLocal() {
  const local = localStorage.getItem('roles');
  return local ? JSON.parse(local) : null;
}

function saveRolesToLocal(roles) {
  localStorage.setItem('roles', JSON.stringify(roles));
}

export default function useRoles() {
  return useQuery({
    queryKey: ['roles'], 
    queryFn: async () => {
      const res = await apiClient.get(ROLES_URL);
      const remoteRoles = res.data || [];
      const localRoles = getRolesFromLocal() || [];
      const merged = [
        ...remoteRoles.map(remoteRole => {
          const local = localRoles.find(localRole => String(localRole.id) === String(remoteRole.id));
          return local ? { ...remoteRole, ...local } : remoteRole;
        }),
        ...localRoles.filter(
          localRole => !remoteRoles.some(remoteRole => String(remoteRole.id) === String(localRole.id))
        ),
      ];
      saveRolesToLocal(merged);
      return merged;
    },
  });
}