import { Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";
import Landing from "./pages/Landing";
import CheckResult from "./pages/CheckResult";

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/check/:hexId" element={<CheckResult />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LanguageProvider>
  );
}
