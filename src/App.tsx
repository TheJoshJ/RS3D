import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Player from "./pages/player/Player";
import QuestList from "./pages/questList/QuestList";
import Quest from "./pages/quest/Quest";
import Home from "./pages/home/Home";
import NotFound from "./pages/notFound/NotFound";
import PageLayout from "./layout/PageLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme-provider";

const publicRoutes = [
  { path: "/", element: <Home /> },
  { path: "/player", element: <Player /> },
  { path: "/player/:username", element: <Player /> },
  { path: "/quests", element: <QuestList /> },
  { path: "/quests/:username", element: <QuestList /> },
  { path: "/quest/:quest", element: <Quest /> },
  { path: "/404", element: <NotFound /> },
];

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {publicRoutes.map((route, index) => (
              <Route
                key={"public-" + index}
                path={route.path}
                element={[<PageLayout key={index}>{route.element}</PageLayout>]}
              />
            ))}

            {/* Fallback Route (404 Not Found) */}
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
