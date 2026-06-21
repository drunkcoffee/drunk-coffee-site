/**
 * App.jsx — example showing how to wire PageTransition
 * 
 * Replace your existing App.jsx with this pattern.
 * Keep all your existing <Route> entries — just wrap them.
 */

import { useLocation, Routes, Route } from "react-router-dom";
import { PageTransition } from "./components/PageTransition";

import HomePage              from "./pages/HomePage";
import ProductDetail         from "./pages/ProductDetail";
import WholesalePage         from "./pages/WholesalePage";
import CoffeeBeansPage       from "./pages/CoffeeBeansPage";
import MonteblancoSeriesPage from "./pages/MonteblancoSeriesPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  const location = useLocation();

  return (
    <PageTransition locationKey={location.key}>
      <Routes location={location}>
        <Route path="/"                       element={<HomePage />}              />
        <Route path="/coffee/:slug"           element={<ProductDetail />}         />
        <Route path="/wholesale"              element={<WholesalePage />}         />
        <Route path="/beans"                  element={<CoffeeBeansPage />}       />
        <Route path="/series/monteblanco"     element={<MonteblancoSeriesPage />} />
        {<Route path="*" element={<NotFoundPage />} />}
      </Routes>
    </PageTransition>
  );
}
