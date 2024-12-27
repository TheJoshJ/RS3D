import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlayerData } from "@/hooks/getPlayerData";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckIcon,
  EllipsisIcon,
  Loader,
  RotateCcw,
  XIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import questData from "@/utils/quests.json";
import { QuestDetailsSlide } from "./QuestDetailsSlide";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  useSearchParams,
} from "react-router-dom";
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

interface PlayerStatsTableProps {
  playerData: PlayerData | undefined;
}

const PlayerStatsTable = ({ playerData }: PlayerStatsTableProps) => {
  const [searchVal, setSearchVal] = useState<string>("");
  const [filterVal, setFilterVal] = useState<string>("all");
  const [searchParams, setSearchParams] = useSearchParams();

  const questName = searchParams.get("quest");

  const resetFilterValues = () => {
    setSearchVal("");
    setFilterVal("all");
  };

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

  const fuse = useMemo(() => {
    return new Fuse(resolvedQuests, {
      keys: ["name"],
      threshold: 0.3,
      minMatchCharLength: 2,
    });
  }, [resolvedQuests]);

  const filteredQuests = useMemo(() => {
    const filteredBySearch = searchVal.trim()
      ? fuse.search(searchVal).map((result) => result.item)
      : resolvedQuests;

    if (filterVal === "all") return filteredBySearch;
    return filteredBySearch.filter((quest) => {
      const questStatus = playerData?.quests?.find(
        (q) => q.title.toLowerCase() === quest.name.toLowerCase()
      )?.status;

      return questStatus?.toLowerCase() === filterVal;
    });
  }, [searchVal, fuse, resolvedQuests, filterVal, playerData]);

  const handleSheetOpen = (quest: string) => {
    setSearchParams({ quest: quest.toLowerCase() });
  };

  const handleSheetClose = () => {
    setSearchParams({});
  };

  if (!playerData || resolvedQuests.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20px]">Complete</TableHead>
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead className="w-[20px]">Points</TableHead>
            <TableHead className="w-[50px]">More</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 24 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-5 w-[100%]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[100%]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[100%]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[100%]" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <>
      <div className="flex flex-row justify-between items-center px-4 py-2 border-b">
        <div className="h-[80%} ">
          <Input
            placeholder="Search by quest"
            value={searchVal}
            onChange={(e) => setSearchVal(e.currentTarget.value)}
          />
        </div>
        <div className={"flex flex=row gap-2"}>
          <Select
            value={filterVal}
            onValueChange={(value) => setFilterVal(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="started">Started</SelectItem>
                <SelectItem value="not_started">Incomplete</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant={"ghost"} onClick={resetFilterValues}>
            <RotateCcw />
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20px]">Complete</TableHead>
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead className="w-[20px]">Points</TableHead>
            <TableHead className="w-[50px]">More</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredQuests.map((quest) => {
            const questStatus = playerData?.quests?.find(
              (q) => q.title.toLowerCase() === quest.name.toLowerCase()
            )?.status;

            return (
              <TableRow key={quest.name}>
                <TableCell>
                  <div className="flex flex-row ">
                    {questStatus === "COMPLETED" ? (
                      <CheckIcon color="green" />
                    ) : questStatus === "STARTED" ? (
                      <Loader color="yellow" />
                    ) : (
                      <XIcon color="red" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span>{quest.name}</span>
                </TableCell>
                <TableCell>{quest.questPoints}</TableCell>
                <TableCell>
                  <EllipsisIcon onClick={() => handleSheetOpen(quest.name)} />
                  <Sheet
                    open={quest.name.toLowerCase() === questName?.toLowerCase()}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) handleSheetClose();
                    }}
                  >
                    <SheetContent
                      className={"text-foreground"}
                      style={{ maxWidth: "50vw" }}
                    >
                      <QuestDetailsSlide
                        playerData={playerData}
                        questData={quest}
                      />
                    </SheetContent>
                  </Sheet>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default PlayerStatsTable;
