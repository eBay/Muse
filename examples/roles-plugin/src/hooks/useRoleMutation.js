import { useMutation, useQueryClient } from '@tanstack/react-query';

// 从本地缓存读取roles key的值；如果有值就从字符串json解析为数组返回
function getRolesFromLocal() {
  const local = localStorage.getItem('roles');
  return local ? JSON.parse(local) : [];
}

// 传入的roles数组转为字符串，存储到localstorage的roles key
function saveRolesToLocal(roles) {
  localStorage.setItem('roles', JSON.stringify(roles));
}

// 添加新角色
export function useAddRole() {
  const queryClient = useQueryClient();
  // 添加角色的异步操作方法
  return useMutation({
	  // 要添加的新角色数据对象
    mutationFn: async (role) => {
	    // 获取本地角色列表
      const roles = getRolesFromLocal();
      // 计算已有角色最大id
      const maxId = roles.length ? Math.max(...roles.map(r => Number(r.id))) : 0;
      // 新角色分配id
      const newRole = { ...role, id: maxId + 1 };
      // 新角色数组
      const updatedRoles = [...roles, newRole];
      // 存入本地
      saveRolesToLocal(updatedRoles);
      return newRole;
    },
    onSuccess: () => {
	    // 刷新
      queryClient.invalidateQueries(['roles']);
    }
  });
}

// 编辑角色
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