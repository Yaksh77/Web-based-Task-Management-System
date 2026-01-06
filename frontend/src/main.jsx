import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";

import { PrimeReactProvider, PrimeReactContext } from "primereact/api";

createRoot(document.getElementById("root")).render(
  <PrimeReactProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </PrimeReactProvider>
);
