import { useMemo } from 'react';

export default function useAvatar(user) {
  return useMemo(() => {
    if (user && user.avatar)
      return `https://buluu97.github.io/muse-next-database/mock/${user.avatar.replace(/^\/*/, '')}`;
    return null;
  }, [user]);
}