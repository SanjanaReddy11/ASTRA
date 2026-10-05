import { createFileRoute } from "@tanstack/react-router";
import App from "../app/App.jsx";

// Catch-all so react-router-dom handles every path client-side.
export const Route = createFileRoute("/$")({
  component: () => <App />,
});
