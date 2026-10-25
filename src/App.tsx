import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MarketingLayout } from "./components/Layout";
import { HomePage } from "./pages/Home";
import { NotFoundPage } from "./pages/NotFound";
import { GuideIndexPage, GuidePage } from "./pages/guides/GuidePage";
import { Pflicht2027Page } from "./pages/guides/Pflicht2027";
import { DatenschutzPage } from "./pages/legal/Datenschutz";
import { ImpressumPage } from "./pages/legal/Impressum";
import { NutzungPage } from "./pages/legal/Nutzung";
import { RuleIndexPage, RulePage } from "./pages/rules/RulePage";
import { AiAssistantsPage } from "./pages/AiAssistants";

const CreatePage = lazy(() =>
  import("./pages/Create").then((module) => ({ default: module.CreatePage })),
);
const OpenPage = lazy(() =>
  import("./pages/Open").then((module) => ({ default: module.OpenPage })),
);

function LazyFallback() {
  return <div style={{ padding: 32 }}>Laden …</div>;
}

/** Shared route tree for browser and prerender. */
export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="erstellen"
        element={
          <Suspense fallback={<LazyFallback />}>
            <CreatePage />
          </Suspense>
        }
      />
      <Route
        path="oeffnen"
        element={
          <Suspense fallback={<LazyFallback />}>
            <OpenPage />
          </Suspense>
        }
      />
      <Route element={<MarketingLayout />}>
        <Route index element={<HomePage />} />
        <Route path="impressum" element={<ImpressumPage />} />
        <Route path="datenschutz" element={<DatenschutzPage />} />
        <Route path="nutzung" element={<NutzungPage />} />
        <Route path="ratgeber" element={<GuideIndexPage />} />
        <Route path="ratgeber/pflicht-2027" element={<Pflicht2027Page />} />
        <Route path="ratgeber/:slug" element={<GuidePage />} />
        <Route path="ki-assistenten" element={<AiAssistantsPage />} />
        <Route path="pruefregeln" element={<RuleIndexPage />} />
        <Route path="pruefregeln/:slug" element={<RulePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
