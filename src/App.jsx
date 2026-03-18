import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CoffeeBeansPage from "./pages/CoffeeBeansPage";
import BeanDetailPage from "./pages/BeanDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/coffee-beans" element={<CoffeeBeansPage />} />
      <Route path="/beans/:slug" element={<BeanDetailPage />} />
    </Routes>
  );
}