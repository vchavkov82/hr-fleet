import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-3xl font-bold">HR Admin</h1>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
