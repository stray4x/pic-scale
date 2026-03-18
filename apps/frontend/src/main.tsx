import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Upscaler from "./components/Upscaler.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Upscaler />
  </StrictMode>,
);
