import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestTree } from "./QuestTree";
import { PlayerData } from "@/hooks/getPlayerData";
import { CheckIcon, Ellipsis, InfoIcon, XIcon } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getSkillImage } from "@/utils/getSkillImage";
import { getSkillId } from "@/utils/getSkillName";

interface QuestSkillReq {
  skill: string;
  level: number;
}

interface QuestRequirements {
  quest: ResolvedQuestData[];
  skill: QuestSkillReq[];
}

interface ResolvedQuestData {
  name: string;
  difficulty: number;
  members: boolean;
  questPoints: number;
  requirements: QuestRequirements;
}

interface QuestCardProps {
  playerData: PlayerData | undefined;
  expanded: boolean;
  onToggle: () => void;
  index: number;
  questData: ResolvedQuestData;
}

export const QuestCard = ({
  expanded,
  onToggle,
  questData,
  playerData,
}: QuestCardProps) => {
  // Check if the quest is completed
  const completed = playerData?.quests?.some(
    (q) =>
      q.title.toLowerCase() === questData.name.toLowerCase() &&
      q.status === "COMPLETED"
  );

  const formatQuestTree = (quest: ResolvedQuestData): any => {
    return {
      id: quest.name,
      name: quest.name,
      children:
        quest.requirements.quest.length > 0
          ? quest.requirements.quest.map(formatQuestTree)
          : undefined,
    };
  };

  // Extracted Function for Skill Requirement Rendering
  const renderSkillRequirement = (
    skill: string,
    level: number,
    playerData: PlayerData | undefined
  ): JSX.Element => {
    const skillId = getSkillId(skill);
    const playerSkillLevel =
      skillId !== undefined
        ? playerData?.skillvalues.find((skill) => skill.id === skillId)
            ?.level ?? 0
        : 0;

    const hasRequirement = level > playerSkillLevel ? false : true;
    return (
      <div className="flex flex-col py-1">
        <div key={skill} className="flex flex-row gap-2 items-center">
          {(hasRequirement && <CheckIcon color="green" />) || (
            <XIcon color="red" />
          )}
          <img src={getSkillImage(skill)} alt={skill} className="h-5 w-5" />
          <span>
            {skill}: {level}
          </span>
        </div>
      </div>
    );
  };

  const collectSkillRequirements = (
    questTree: ResolvedQuestData
  ): { skill: string; level: number }[] => {
    const skillMap: Record<string, number> = {};

    const traverse = (quest: ResolvedQuestData) => {
      // Ensure requirements and skill exist before proceeding
      if (quest.requirements?.skill) {
        quest.requirements.skill.forEach(({ skill, level }) => {
          if (!skillMap[skill] || skillMap[skill] < level) {
            skillMap[skill] = level; // Keep the highest level for each skill
          }
        });
      }

      // Recursively process child quests if they exist
      if (quest.requirements?.quest) {
        quest.requirements.quest.forEach((childQuest) => {
          traverse(childQuest);
        });
      }
    };

    traverse(questTree);

    // Convert the skill map back into an array of objects
    return Object.entries(skillMap).map(([skill, level]) => ({ skill, level }));
  };

  // Build the tree structure starting with the top-level quest
  const treeData = formatQuestTree(questData);
  const skillRequirements = collectSkillRequirements(questData);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-row justify-between items-center">
          <CardTitle className="flex flex-row gap-5 items-center">
            {questData.name}
            {completed ? <CheckIcon color="green" /> : <XIcon color="red" />}
          </CardTitle>
          <Button variant="ghost" onClick={onToggle}>
            <Ellipsis />
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div className="flex flex-row justify-between pl-4">
            <div className="flex flex-col w-[35%] gap-y-6">
              <div>
                <p className="font-bold border-b">Skill Requirements</p>
                {questData.requirements.skill.length > 0 ? (
                  questData.requirements.skill.map(({ skill, level }) =>
                    renderSkillRequirement(skill, level, playerData)
                  )
                ) : (
                  <span className="text-muted-foreground line-through">
                    None
                  </span>
                )}
              </div>
              <div>
                <div className="flex flex-row border-b gap-2 items-center">
                  <p className="font-bold">True Skill Requirements</p>
                  {
                    <HoverCard>
                      <HoverCardTrigger>
                        <InfoIcon size={16} />
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold border-b">
                            True Skill Requirement
                          </h4>
                          <p className="text-sm">
                            This accounts for all skill levels needed to
                            complete this quest as well as all of its
                            prerequisite quests.
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  }
                </div>
                {skillRequirements.length > 0 ? (
                  skillRequirements.map((skillReq) =>
                    renderSkillRequirement(
                      skillReq.skill,
                      skillReq.level,
                      playerData
                    )
                  )
                ) : (
                  <span className="text-muted-foreground line-through">
                    None
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col w-[60%]">
              <p className="font-bold border-b">Quest Requirements</p>
              <QuestTree
                data={[treeData]}
                expandAll={true}
                className="flex-shrink-0"
                initialSlelectedItemId="f12"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
