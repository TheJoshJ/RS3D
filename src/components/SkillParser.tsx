import { useState, useEffect } from "react";

export const SkillParser = () => {
  const [inputText, setInputText] = useState("");
  const [outputJson, setOutputJson] = useState<
    { skill: string; level: number }[]
  >([]);

  useEffect(() => {
    const lines = inputText.split("\n");
    const parsedData = lines
      .map((line) => {
        const parts = line.trim().split(" ");

        if (parts.length >= 2) {
          const level = parseInt(parts[0], 10);
          const skill = parts[1].toLowerCase();

          return {
            skill,
            level,
          };
        }
        return null;
      })
      .filter(Boolean) as { skill: string; level: number }[];

    setOutputJson(parsedData);
  }, [inputText]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(outputJson, null, 2));
  };

  return (
    <div className="flex flex-col w-[30%] p-4 justify-center">
      <h1 className="text-lg font-bold mb-2">Skill Parser</h1>
      <textarea
        className="w-full border p-2 mb-4 bg-primary text-secondary"
        rows={10}
        placeholder="Enter your skills text here"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      ></textarea>
      <button
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4"
        onClick={handleCopyToClipboard}
      >Copy To Clipboard</button>
      <pre className="mt-4  p-2 border rounded">
        {JSON.stringify(outputJson, null, 2)}
      </pre>
    </div>
  );
};

export default SkillParser;
