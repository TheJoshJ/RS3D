import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { QuestTree } from "./QuestTree";
import { PlayerData } from "@/hooks/getPlayerData";
import { CheckIcon, InfoIcon, XIcon } from "lucide-react";
import { getSkillImage } from "@/utils/getSkillImage";
import { getSkillId } from "@/utils/getSkillName";
import { HoverCard, HoverCardContent } from "@/components/ui/hover-card";
import { HoverCardTrigger } from "@radix-ui/react-hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
  questData: ResolvedQuestData;
}

export const QuestDetailsSlide = ({
  questData,
  playerData,
}: QuestCardProps) => {
  const formatQuestTree = (quest: ResolvedQuestData): any => {
    // Find the quest status from playerData
    const questStatus = playerData?.quests?.find(
      (q) => q.title.toLowerCase() === quest.name.toLowerCase()
    )?.status;

    return {
      id: quest.name,
      name: quest.name,
      status: questStatus || "unknown",
      children:
        quest.requirements.quest.length > 0
          ? quest.requirements.quest.map(formatQuestTree)
          : undefined,
    };
  };

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
             // Keep the highest level for each skill
            skillMap[skill] = level;
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

    return Object.entries(skillMap).map(([skill, level]) => ({ skill, level }));
  };

  const calculateQuestProgress = (tree: any) => {
    const visited = new Set<string>();
    let completedCount = 0;
    let totalCount = 0;

    const traverse = (node: any) => {
      if (!node || visited.has(node.id)) return;

      visited.add(node.id);
      totalCount++;

      if (node.status === "COMPLETED") {
        completedCount++;
      }

      if (node.children) {
        node.children.forEach((child: any) => traverse(child));
      }
    };

    traverse(tree);

    const percentage =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    return {
      questPercentage: percentage,
      questCompleted: completedCount,
      questNeeded: totalCount,
    };
  };

  const treeData = formatQuestTree(questData);
  const skillRequirements = collectSkillRequirements(questData);
  const { questPercentage, questCompleted, questNeeded } =
    calculateQuestProgress(treeData);

  return (
    <div>
      <SheetHeader>
        <SheetTitle>
          <div className="border-b border-y-muted-foreground pb-2">
            {questData.name}
          </div>
        </SheetTitle>
      </SheetHeader>
      <ScrollArea className={"h-[100vh] pb-12"}>
        <div
          className={
            "flex flex-row items-center justify-between pl-4 pt-6 pb-6 border-b border-muted-foreground"
          }
        >
          <div className={"w-[35%]"}>
            <Button
              onClick={() => {
                window.open(
                  `https://runescape.wiki/w/${questData.name}/Quick_guide`,
                  "_blank"
                );
              }}
              variant="outline"
              className={"w-full"}
            >
              View on Wiki
            </Button>
          </div>
          <div className={"flex flex-col w-[60%] items-center"}>
            <div className={"w-[60%]"}>
              <p className={"text-center"}>
                Current Progress: {questCompleted}/{questNeeded}
              </p>
              <Progress value={questPercentage} />
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-between pl-4">
          <div className="flex flex-col w-[35%] gap-y-6 pt-2">
            <div>
              <p className="font-bold border-b">Skill Requirements</p>
              {(questData.requirements?.skill || []).length > 0 ? (
                (questData.requirements.skill || []).map(({ skill, level }) =>
                  renderSkillRequirement(skill, level, playerData)
                )
              ) : (
                <span className="text-muted-foreground line-through">None</span>
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
                          This accounts for all skill levels needed to complete
                          this quest as well as all of its prerequisite quests.
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
                <span className="text-muted-foreground line-through">None</span>
              )}
            </div>
          </div>
          <div className="flex flex-col w-[60%] pt-2">
            <p className="font-bold border-b">Quest Requirements</p>
            <QuestTree
              data={[treeData]}
              expandAll={true}
              className="flex-shrink-0"
              initialSlelectedItemId="f15"
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
