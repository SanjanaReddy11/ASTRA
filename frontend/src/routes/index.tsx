import { createFileRoute } from "@tanstack/react-router";
import App from "../app/App.jsx";

export const Route = createFileRoute("/")({
  component: () => <App />,
});
