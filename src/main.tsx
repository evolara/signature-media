
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { injectSpeedInsights } from "@vercel/speed-insights";

  injectSpeedInsights();

  createRoot(document.getElementById("root")!).render(<App />);
  