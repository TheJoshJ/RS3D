import { useState, useMemo } from "react";
import { QuestCard } from "./QuestCard";
import { PlayerData } from "@/hooks/getPlayerData";
import questData from "@/utils/quests.json";
interface QuestSkillReq {
  skill: string;
  level: number;
}

interface QuestRequirements {
  quest: string[];
  skill: QuestSkillReq[];
}

interface QuestData {
  name: string;
  difficulty: number;
  members: boolean;
  questPoints: number;
  requirements: QuestRequirements;
}

//Too lazy to figure out the typing here - been at this for too long and it's not breaking anything (yet)
const buildQuestTree = (
  questName: string,
  questMap: Record<string, QuestData>
): any => {
  const quest = questMap[questName];

  // Handle edge case: missing quest name (needed once the API is added in)
  if (!quest) {
    return {
      name: questName,
      difficulty: 0,
      members: false,
      questPoints: 0,
      requirements: { quest: [], skill: [] },
    };
  }

  return {
    ...quest,
    requirements: {
      skill: quest.requirements.skill,
      quest: quest.requirements.quest.map((childQuestName) =>
        buildQuestTree(childQuestName, questMap)
      ),
    },
  };
};


interface QuestRecomendationsProps {
  playerData: PlayerData | undefined;
}

const QuestRecomendations = ({ playerData }: QuestRecomendationsProps) => {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRow = (idx: number) => {
    setExpandedRows((prev) => ({ [idx]: !prev[idx] }));
  };

  // Memoized quest map for fast lookup
  const questMap = useMemo(() => {
    return questData.Quests.reduce((acc: Record<string, QuestData>, quest) => {
      acc[quest.name] = quest;
      return acc;
    }, {});
  }, []);

  // Resolve the quest tree for all top-level quests
  const resolvedQuests = useMemo(() => {
    return questData.Quests.map((quest) =>
      buildQuestTree(quest.name, questMap)
    );
  }, [questMap]);

  return (
    <div className="p-4">
      <h2 className="text-3xl pb-2 font-semibold text-center">Quest List</h2>
      <div className="flex flex-col items-center gap-2">
        {resolvedQuests.map((quest, idx) => (
          <QuestCard
            key={quest.name}
            index={idx}
            expanded={expandedRows[idx]}
            onToggle={() => toggleRow(idx)}
            playerData={playerData}
            questData={quest}
          />
        ))}
      </div>
    </div>
  );
};

export default QuestRecomendations;
