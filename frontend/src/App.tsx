import "./App.css";
import Toolbar from "@mui/material/Toolbar";
import Navbar from "./components/navbar";
import LandingPage from "./pages/landingPage";
import LoginPage from "./pages/loginPage";
import SignUpPage from "./pages/signUpPage";
import { Routes, Route } from "react-router-dom";
import SettingsPage from "./pages/settingsPage";
import ClassPage from "./pages/classPage";

function App() {
  return (
    <>
      <Navbar />
      <Toolbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/classOverview/:id" element={<ClassPage />} />
      </Routes>
    </>
  );
}

export default App;
