import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlayerData } from "@/hooks/getPlayerData";
import { formatNumber } from "@/utils/formatNumber";
import { getSkillName } from "@/utils/getSkillName";
import { Skeleton } from "@/components/ui/skeleton";
import LevelBar from "./LevelBar";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { MonthlyExpChart } from "./MonthlyExpChart";
import { getSkillImage } from "@/utils/getSkillImage";

interface PlayerStatsTableProps {
  playerData: PlayerData | undefined;
  loading: boolean;
}

const QuestTable = ({ playerData, loading }: PlayerStatsTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRow = (skillId: number) => {
    setExpandedRows((prev) => {
      // If expanded, close
      const newExpandedRows = { [skillId]: !prev[skillId] };
      return newExpandedRows;
    });
  };

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Skill</TableHead>
            <TableHead className="w-[100px]">Level</TableHead>
            <TableHead className="w-[100px]">Experience</TableHead>
            <TableHead className="w-[100px]">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 25 }).map((_, index) => (
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
                <div className={"flex flex-row"}>
                  <ChevronRight className={"border rounded"} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (!playerData || !playerData.skillvalues) {
    return <div>No data available</div>;
  }

  const sortedSkillValues = [...playerData.skillvalues].sort(
    (a, b) => a.id - b.id
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Skill</TableHead>
          <TableHead className="w-[100px]">Level</TableHead>
          <TableHead className="w-[100px]">Experience</TableHead>
          <TableHead className="w-[10px]">Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow key={"total"}>
          <TableCell>
            <div className="flex items-center space-x-2">
              <img
                src={"/skills/overall.png"}
                alt={"Total Level"}
                className="h-6 w-6"
              />
              <span>{"Total"}</span>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex flex-row gap-2">
              <div className="w-5">{playerData.totalskill}</div>
            </div>
          </TableCell>
          <TableCell>{formatNumber(Math.round(playerData.totalxp))}</TableCell>
          <TableCell>
            <div className={"flex flex-row"}>
              {!!expandedRows[-1] ? (
                <ChevronDown
                  className={"border rounded"}
                  onClick={() => {
                    toggleRow(-1);
                  }}
                />
              ) : (
                <ChevronRight
                  className={"border rounded"}
                  onClick={() => {
                    toggleRow(-1);
                  }}
                />
              )}
            </div>
          </TableCell>
        </TableRow>
        <>
          {!!expandedRows[-1] && (
            <TableRow>
              <TableCell colSpan={4}>
                <MonthlyExpChart
                  key={-1}
                  username={playerData.name || ""}
                  skillId={-1}
                />
              </TableCell>
            </TableRow>
          )}
        </>
        {sortedSkillValues.map((skill) => {
          const isExpanded = !!expandedRows[skill.id];
          return (
            <>
              <TableRow key={skill.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <img
                      src={getSkillImage(skill.id)}
                      alt={getSkillName(skill.id)}
                      className="h-6 w-6"
                    />
                    <span>{getSkillName(skill.id)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-row gap-2">
                    <div className="w-5">{skill.level}</div>
                    <LevelBar skill={skill} />
                  </div>
                </TableCell>
                <TableCell>{formatNumber(Math.round(skill.xp / 10))}</TableCell>
                <TableCell>
                  <div className={"flex flex-row"}>
                    {isExpanded ? (
                      <ChevronDown
                        className={"border rounded"}
                        onClick={() => {
                          toggleRow(skill.id);
                        }}
                      />
                    ) : (
                      <ChevronRight
                        className={"border rounded"}
                        onClick={() => {
                          toggleRow(skill.id);
                        }}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
              {isExpanded && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <MonthlyExpChart
                      key={skill.id}
                      username={playerData.name || ""}
                      skillId={skill.id}
                    />
                  </TableCell>
                </TableRow>
              )}
            </>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default QuestTable;
