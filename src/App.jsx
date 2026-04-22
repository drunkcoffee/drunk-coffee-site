import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductDetail from "./pages/ProductDetail";
import MonteblancoSeriesPage from "./pages/MonteblancoSeriesPage";
import WholesalePage from "./pages/WholesalePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/coffee/:slug" element={<ProductDetail />} />
      <Route path="/series/monteblanco" element={<MonteblancoSeriesPage />} />
      <Route path="/wholesale" element={<WholesalePage />} />
    </Routes>
  );
}
