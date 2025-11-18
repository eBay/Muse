import { useQuery } from '@tanstack/react-query';

export default function useUserDetail(id) {
  return useQuery({
    queryKey: ['userDetail', String(id)],
    enabled: !!id,
    queryFn: async () => {
      const local = localStorage.getItem('users');
      const users = local ? JSON.parse(local) : [];
      const user = users.find(u => String(u.id) === String(id));
      return user || null;
    },
  });
}