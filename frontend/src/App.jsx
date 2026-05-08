import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "./stages/LoadingScreen";
import LandingPage   from "./stages/LandingPage";
import AppScreen     from "./stages/AppScreen";
import MouseCursor   from "./components/MouseCursor";

// stage: "loading" → "landing" → "app"
export default function App() {
  const [stage, setStage] = useState("loading");

  return (
    <>
      {/* Global custom cursor — always on top */}
      <MouseCursor />

      <AnimatePresence mode="wait">
        {stage === "loading" && (
          <LoadingScreen key="loading" onDone={() => setStage("landing")} />
        )}
        {stage === "landing" && (
          <LandingPage key="landing" onStart={() => setStage("app")} />
        )}
        {stage === "app" && (
          <AppScreen key="app" onBack={() => setStage("landing")} />
        )}
      </AnimatePresence>
    </>
  );
}
