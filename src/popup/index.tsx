import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MainPopup } from "./components/MainPopup/MainPopup";
import "../shared/index.css";

// Use the existing root div from HTML
const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element not found");
}

// Create React root
createRoot(rootElement).render(
	<StrictMode>
		<MainPopup />
	</StrictMode>,
);
