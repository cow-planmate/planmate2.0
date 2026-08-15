import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFriendRequest, fetchChatRooms, fetchFriends, searchUsers } from '../api/socialApi';
export const SOCIAL_KEYS = { friends: (q = '') => ['social','friends',q] as const, rooms: ['social','rooms'] as const, users: (q:string) => ['social','users',q] as const };
export const useFriends = (q = '') => useQuery({ queryKey: SOCIAL_KEYS.friends(q), queryFn: () => fetchFriends(q), staleTime: 30_000 });
export const useChatRooms = () => useQuery({ queryKey: SOCIAL_KEYS.rooms, queryFn: fetchChatRooms, staleTime: 15_000 });
export const useUserSearch = (q:string) => useQuery({ queryKey: SOCIAL_KEYS.users(q), queryFn: () => searchUsers(q), enabled: q.trim().length > 0 });
export const useFriendRequest = () => { const client=useQueryClient(); return useMutation({ mutationFn:createFriendRequest, onSuccess:()=>client.invalidateQueries({queryKey:['social']}) }); };
