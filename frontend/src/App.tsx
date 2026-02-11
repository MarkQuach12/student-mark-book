import "./App.css";
import Navbar from "./components/navbar";
import LandingPage from "./pages/landingPage";
import LoginPage from "./pages/loginPage";
import SignUpPage from "./pages/signUpPage";
import { Routes, Route } from "react-router-dom";
import ProfilePage from "./pages/profilePage";
import ClassPage from "./pages/classPage";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/classOverview/:id" element={<ClassPage />} />
      </Routes>
    </>
  );
}

export default App;
