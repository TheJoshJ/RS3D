import { useQuery } from "@tanstack/react-query";

export interface activities {
  date: string;
  details: string;
  text: string;
}

export interface skillValues {
  level: number;
  xp: number;
  rank: number;
  id: number;
}

export interface quest {
  title: string;
  status: string;
  difficulty: number;
  members: boolean;
  questPoints: number;
  userEligable: boolean;
}

export interface PlayerData {
  magic: number;
  questsStarted: number;
  totalskill: number;
  questscomplete: number;
  questsstarted: number;
  totalxp: number;
  ranged: number;
  activities: activities[];
  skillvalues: skillValues[];
  name: string;
  melee: number;
  combatlevel: number;
  loggedIn: string;
  quests: quest[];
}

export const getPlayerData = (username: string, quests: boolean) => {
  return useQuery<PlayerData, Error>({
    queryKey: ["PlayerData", username],
    queryFn: async () => {
      const response = await fetch(
        `https://api.rs3pd.com/api/v1/player-data?username=${username}&quests=${quests}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch player data");
      }
      return response.json();
    },
    enabled: !!username,
  });
};
