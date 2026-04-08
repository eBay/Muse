import { useMutation, useQueryClient } from '@tanstack/react-query';

function getRolesFromLocal() {
  const local = localStorage.getItem('roles');
  return local ? JSON.parse(local) : [];
}

function saveRolesToLocal(roles) {
  localStorage.setItem('roles', JSON.stringify(roles));
}

export function useAddRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (role) => {
      const roles = getRolesFromLocal();
      const maxId = roles.length ? Math.max(...roles.map(r => Number(r.id))) : 0;
      const newRole = { ...role, id: maxId + 1 };
      const updatedRoles = [...roles, newRole];
      saveRolesToLocal(updatedRoles);
      return newRole;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
    }
  });
}

export function useEditRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (role) => {
      const roles = getRolesFromLocal();
      const idx = roles.findIndex(r => String(r.id) === String(role.id));
      if (idx !== -1) {
        roles[idx] = { ...roles[idx], ...role };
        saveRolesToLocal(roles);
      }
      return role;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['roles']);
      if (variables && variables.id) {
        queryClient.invalidateQueries(['roleDetail', String(variables.id)]);
      }
    }
  });
}
