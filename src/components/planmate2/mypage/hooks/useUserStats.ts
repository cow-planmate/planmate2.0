import { useMemo } from 'react';
import { LEVEL_CONFIG } from '../constants';
import { UserStats } from '../types';

export const useUserStats = (stats: UserStats) => {
  const exp = useMemo(() => {
    return (stats.forks * 5) + (stats.feedPosts * 10) + (stats.community * 5) + (stats.comments * 2) + stats.attendance;
  }, [stats]);

  const currentLevelInfo = useMemo(() => {
    return LEVEL_CONFIG.find(l => exp >= l.min && exp <= l.max) || LEVEL_CONFIG[0];
  }, [exp]);

  const userLevel = currentLevelInfo.lv;
  const levelName = currentLevelInfo.name;

  const nextLevelInfo = useMemo(() => {
    return LEVEL_CONFIG[userLevel] || null;
  }, [userLevel]);

  const displayMax = useMemo(() => {
    return nextLevelInfo ? nextLevelInfo.min + (nextLevelInfo.max - nextLevelInfo.min + 1) : 100;
  }, [nextLevelInfo]);

  const currentLevelMax = currentLevelInfo.max + 1;
  const remainingCount = currentLevelMax - exp;

  return {
    exp,
    userLevel,
    levelName,
    currentLevelInfo,
    nextLevelInfo,
    displayMax,
    remainingCount,
  };
};
