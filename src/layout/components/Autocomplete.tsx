import { MapIcon, SearchIcon, UserIcon } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useEffect, useRef, useState } from "react";
import Quests from "@/utils/quests.json";
import Fuse from "fuse.js";
import { useNavigate } from "react-router";

export function Autocomplete() {
  const [selected, setSelected] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const LOCAL_STORAGE_KEY = "RS3PD_v1_favorite_users";

  // Safeguard for invalid quest data
  const questData = Quests ?? { Quests: [] };

  // Fuse.js configuration
  const fuse = new Fuse(questData.Quests, {
    keys: ["name"],
    threshold: 0.3,
    minMatchCharLength: 1,
  });

  const filteredResults = Array.isArray(questData.Quests)
    ? search
      ? fuse
          .search(search)
          .slice(0, 3)
          .map((result) => result.item)
      : questData.Quests.sort((a, b) => a.name.localeCompare(b.name)).slice(
          0,
          3
        )
    : [];

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "Escape" || event.key === "Enter") && selected) {
        inputRef.current?.blur();
        setSelected(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handlePlayerSearch = (value: string) => {
    if (selected) {
      inputRef.current?.blur();
      setSelected(false);
    }
    if (value.trim()) {
      navigate(`/player/${value.trim()}`);
    }
  };

  const handleQuestSelect = (name: string) => {
    if (selected) {
      inputRef.current?.blur();
      setSelected(false);
    }
    navigate(`/quest/${name}`);
  };

  useEffect(() => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      setFavorites(JSON.parse(data));
    }
  }, [selected]);

  return (
    <div className="relative">
      <Command
        loop
        shouldFilter={false}
        className="rounded-lg border md:min-w-[250px]"
        onClick={() => setSelected(true)}
        onFocus={() => setSelected(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setSelected(false);
          }
        }}
      >
        <CommandInput
          ref={inputRef}
          value={search}
          onValueChange={setSearch}
          placeholder="Search a user or quest..."
        />
        {selected && (
          <div className="absolute left-0 top-full mt-1 z-50 w-full h-auto rounded-lg border bg-background">
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {search && (
                <CommandGroup className="border-b">
                  <CommandItem onSelect={() => handlePlayerSearch(search)}>
                    <SearchIcon />
                    <span>Search: {search}</span>
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup
                heading={(favorites.length > 0 && "Favorite Users") || ""}
              >
                {favorites.length > 0
                  ? favorites.map((user: string) => (
                      <CommandItem
                        onSelect={() => handlePlayerSearch(user)}
                        key={user}
                      >
                        <UserIcon />
                        <span>{user}</span>
                      </CommandItem>
                    ))
                  : null}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Quests">
                {filteredResults.length > 0 ? (
                  filteredResults.map((quest) => (
                    <CommandItem
                      onSelect={() => handleQuestSelect(quest.name)}
                      key={quest.name}
                    >
                      <MapIcon />
                      <span>{quest.name}</span>
                    </CommandItem>
                  ))
                ) : (
                  <CommandItem>
                    <span className="w-[100%] text-center text-sm text-foreground">
                      No matching quests found.
                    </span>
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
}
