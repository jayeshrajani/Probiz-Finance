import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

export default function AdminRoot() {
  return (
    <HashRouter>
      <App />
    </HashRouter>
  );
}
