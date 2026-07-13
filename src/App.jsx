/**
 * App.jsx -example showing how to wire PageTransition
 *
 * Replace your existing App.jsx with this pattern.
 * Keep all your existing <Route> entries -just wrap them.
 */

import { useLocation, Routes, Route } from "react-router-dom";
import { PageTransition } from "./components/PageTransition";

import HomePage              from "./pages/HomePage";
import ProductDetail         from "./pages/ProductDetail";
import WholesalePage         from "./pages/WholesalePage";
import CoffeeBeansPage       from "./pages/CoffeeBeansPage";
import NotFoundPage from "./pages/NotFoundPage";
import LabelPreview from "./pages/LabelPreview";

export default function App() {
  const location = useLocation();

  return (
    <PageTransition locationKey={location.key}>
      <Routes location={location}>
        <Route path="/"                       element={<HomePage />}              />
        <Route path="/coffee/:slug"           element={<ProductDetail />}         />
        <Route path="/wholesale"              element={<WholesalePage />}         />
        <Route path="/shop"                   element={<CoffeeBeansPage />}       />
        <Route path="/beans"                  element={<CoffeeBeansPage />}       />
        <Route path="/label-preview"          element={<LabelPreview />}          />
        {<Route path="*" element={<NotFoundPage />} />}
      </Routes>
    </PageTransition>
  );
}
