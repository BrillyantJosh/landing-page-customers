import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import CheckResult from "./pages/CheckResult";
import PravicaDoObilja from "./pages/PravicaDoObilja";
import KakoDodenarnice from "./pages/KakoDodenarnice";
import NovaRealnost from "./pages/NovaRealnost";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/check/:hexId" element={<CheckResult />} />
      <Route path="/pravica-do-obilja" element={<PravicaDoObilja />} />
      <Route path="/kako-do-denarnice" element={<KakoDodenarnice />} />
      <Route path="/nova-realnost" element={<NovaRealnost />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
