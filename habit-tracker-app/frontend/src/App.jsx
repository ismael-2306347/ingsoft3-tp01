import { BrowserRouter, Route, Routes } from "react-router-dom";
import missingModule from "./pages/NoExiste";

import DashboardPage from "./pages/DashboardPage";
import HabitDetailPage from "./pages/HabitDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/habits/:id" element={<HabitDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
