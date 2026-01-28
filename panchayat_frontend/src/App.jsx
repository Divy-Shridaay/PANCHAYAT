import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Core
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";

// Settings
import SettingsHome from "./pages/settings/SettingsHome";
import ProfileSettings from "./pages/settings/ProfileSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";

// Help (under settings)
import HelpSettings from "./pages/settings/help/HelpSettings";
import VideoHelp from "./pages/settings/help/VideoHelp";
import DocumentHelp from "./pages/settings/help/DocumentHelp";
import FaqHelp from "./pages/settings/help/FaqHelp";

// Video sub-pages
import LoginRegisterVideo from "./pages/settings/help/videos/LoginRegisterVideo";
import PedhinamuVideo from "./pages/settings/help/videos/PedhinamuVideo";
import RojmelVideo from "./pages/settings/help/videos/RojmelVideo";


// Pedhinamu
import PedhinamuHome from "./pages/PedhinamuHome";
import Pedhinamu from "./pages/Pedhinamu";
import FullForm from "./pages/FullForm";
import PedhinamuList from "./pages/PedhinamuList";
import PedhinamuView from "./pages/PedhinamuView";

// Records
import Records from "./pages/Records";
import RecordView from "./pages/RecordView";

// CashMel
import CashMelForm from "./pages/CashMelForm";
import CashMelDetails from "./pages/CashMelDetails";
import CashMelView from "./pages/CashMelView";
import Payment from "./pages/Payment";

// Components
import PrivateRoute from "./components/PrivateRoute";


import PdfViewer from "./pages/settings/help/PdfViewer";

import ChangePassword from "./pages/settings/ChangePassword";


import CategorySettings from "./pages/settings/CategorySettings";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ===================== AUTH (PUBLIC) ===================== */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ===================== CORE (PROTECTED) ===================== */}
        <Route
          path="/dashboard"
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />

        <Route
          path="/settings/help/documents/view/:filename"
          element={
            <PrivateRoute>
              <PdfViewer />
            </PrivateRoute>
          }
        />


        <Route
          path="/admin"
          element={<PrivateRoute><AdminPanel /></PrivateRoute>}
        />

        {/* ===================== SETTINGS ===================== */}
        <Route
          path="/settings"
          element={<PrivateRoute><SettingsHome /></PrivateRoute>}
        />

        <Route
          path="/settings/profile"
          element={<PrivateRoute><ProfileSettings /></PrivateRoute>}
        />

        <Route path="/settings/categories" element={<CategorySettings />} />


        <Route
          path="/settings/security"
          element={<PrivateRoute><SecuritySettings /></PrivateRoute>}
        />

        {/* ===================== HELP (UNDER SETTINGS) ===================== */}
        <Route
          path="/settings/help"
          element={<PrivateRoute><HelpSettings /></PrivateRoute>}
        />

        <Route
          path="/settings/help/videos"
          element={<PrivateRoute><VideoHelp /></PrivateRoute>}
        />

        <Route
          path="/settings/help/documents"
          element={<PrivateRoute><DocumentHelp /></PrivateRoute>}
        />

        <Route
          path="/settings/help/faq"
          element={<PrivateRoute><FaqHelp /></PrivateRoute>}
        />

        {/* ===================== PEDHINAMU ===================== */}
        <Route
          path="/pedhinamu"
          element={<PrivateRoute><PedhinamuHome /></PrivateRoute>}
        />

        <Route
          path="/pedhinamu/create"
          element={<PrivateRoute><Pedhinamu /></PrivateRoute>}
        />

        <Route
          path="/pedhinamu/edit/:id"
          element={<PrivateRoute><Pedhinamu /></PrivateRoute>}
        />

        <Route
          path="/pedhinamu/list"
          element={<PrivateRoute><PedhinamuList /></PrivateRoute>}
        />

        <Route
          path="/pedhinamu/view/:id"
          element={<PrivateRoute><PedhinamuView /></PrivateRoute>}
        />

        <Route
          path="/pedhinamu/form/:id"
          element={<PrivateRoute><FullForm /></PrivateRoute>}
        />

        {/* ===================== RECORDS ===================== */}
        <Route
          path="/records"
          element={<PrivateRoute><Records /></PrivateRoute>}
        />

        <Route
          path="/records/view/:id"
          element={<PrivateRoute><RecordView /></PrivateRoute>}
        />

        {/* ===================== CASHMEL ===================== */}
        <Route
          path="/cashmelform"
          element={<PrivateRoute><CashMelForm /></PrivateRoute>}
        />

        <Route
          path="/cashmelform/:id"
          element={<PrivateRoute><CashMelForm /></PrivateRoute>}
        />

        <Route
          path="/cashmel/details"
          element={<PrivateRoute><CashMelDetails /></PrivateRoute>}
        />

        <Route
          path="/cashmel/details/:id"
          element={<PrivateRoute><CashMelDetails /></PrivateRoute>}
        />

        <Route
          path="/cashmel/view/:id"
          element={<PrivateRoute><CashMelView /></PrivateRoute>}
        />


        <Route
          path="/settings/help/videos/login-register"
          element={<PrivateRoute><LoginRegisterVideo /></PrivateRoute>}
        />

        <Route
          path="/settings/help/videos/pedhinamu"
          element={<PrivateRoute><PedhinamuVideo /></PrivateRoute>}
        />

        <Route
          path="/settings/help/videos/rojmel"
          element={<PrivateRoute><RojmelVideo /></PrivateRoute>}
        />

        <Route
          path="/settings/security/change-password"
          element={<ChangePassword />}
        />

        <Route
          path="/payment"
          element={<PrivateRoute><Payment /></PrivateRoute>}
        />


      </Routes>
    </BrowserRouter>
  );
}
