import { useEffect, useState } from "react";
import { useParams } from "react-router";
import QuestRecomendations from "./components/QuestRecomendations";
import { getPlayerData } from "@/hooks/getPlayerData";

function QuestList() {
  const { username } = useParams();
  const [playerName, setPlayerName] = useState<string | undefined>("");

  const { data: playerData } = getPlayerData(
    username || "",
    true
  );
  console.log(playerName);

  useEffect(() => {
    setPlayerName(username);
  }, [username]);

  return (
    <div className="flex flex-col items-center gap-5 h-auto w-screen">
      <p className="text-3xl">Welcome to the Quest List page, Partner! 🤠</p>
      <QuestRecomendations playerData={playerData} />
    </div>
  );
}

export default QuestList;
