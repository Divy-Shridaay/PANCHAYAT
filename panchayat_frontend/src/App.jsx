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
import Invoices from "./pages/settings/Invoices";
import InvoiceDetails from "./pages/settings/InvoiceDetails";

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
import ModuleAccessGuard from "./components/ModuleAccessGuard";
import AdminGuard from "./components/AdminGuard";
import UserGuard from "./components/UserGuard";
import GuestGuard from "./components/GuestGuard";


import PdfViewer from "./pages/settings/help/PdfViewer";

import ChangePassword from "./pages/settings/ChangePassword";


import CategorySettings from "./pages/settings/CategorySettings";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ===================== AUTH (PUBLIC) ===================== */}
        <Route path="/" element={<GuestGuard><Login /></GuestGuard>} />
        <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
        <Route path="/register" element={<GuestGuard><Register /></GuestGuard>} />
        <Route path="/forgot-password" element={<GuestGuard><ForgotPassword /></GuestGuard>} />
        <Route path="/reset-password/:token" element={<GuestGuard><ResetPassword /></GuestGuard>} />

        {/* ===================== CORE (PROTECTED) ===================== */}
        <Route
          path="/dashboard"
          element={<PrivateRoute><UserGuard><Dashboard /></UserGuard></PrivateRoute>}
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
          element={<PrivateRoute><AdminGuard><AdminPanel /></AdminGuard></PrivateRoute>}
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

        <Route path="/settings/categories" element={<PrivateRoute><CategorySettings /></PrivateRoute>} />


        <Route
          path="/settings/security"
          element={<PrivateRoute><SecuritySettings /></PrivateRoute>}
        />

        <Route
          path="/settings/invoices"
          element={<PrivateRoute><Invoices /></PrivateRoute>}
        />

        <Route
          path="/settings/invoices/:id"
          element={<PrivateRoute><InvoiceDetails /></PrivateRoute>}
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
          element={<PrivateRoute><ModuleAccessGuard moduleName="pedhinamu"><PedhinamuHome /></ModuleAccessGuard></PrivateRoute>}
        />

        <Route
          path="/pedhinamu/create"
          element={<PrivateRoute><ModuleAccessGuard moduleName="pedhinamu"><Pedhinamu /></ModuleAccessGuard></PrivateRoute>}
        />

        <Route
          path="/pedhinamu/edit/:id"
          element={<PrivateRoute><ModuleAccessGuard moduleName="pedhinamu"><Pedhinamu /></ModuleAccessGuard></PrivateRoute>}
        />

        <Route
          path="/pedhinamu/list"
          element={<PrivateRoute><ModuleAccessGuard moduleName="pedhinamu"><PedhinamuList /></ModuleAccessGuard></PrivateRoute>}
        />

        <Route
          path="/pedhinamu/view/:id"
          element={<PrivateRoute><ModuleAccessGuard moduleName="pedhinamu"><PedhinamuView /></ModuleAccessGuard></PrivateRoute>}
        />

        <Route
          path="/pedhinamu/form/:id"
          element={<PrivateRoute><ModuleAccessGuard moduleName="pedhinamu"><FullForm /></ModuleAccessGuard></PrivateRoute>}
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
          element={<PrivateRoute><ModuleAccessGuard moduleName="rojmel"><CashMelForm /></ModuleAccessGuard></PrivateRoute>}
        />

        <Route
          path="/cashmelform/:id"
          element={<PrivateRoute><ModuleAccessGuard moduleName="rojmel"><CashMelForm /></ModuleAccessGuard></PrivateRoute>}
        />

        <Route
          path="/cashmel/details"
          element={<PrivateRoute><ModuleAccessGuard moduleName="rojmel"><CashMelDetails /></ModuleAccessGuard></PrivateRoute>}
        />

        <Route
          path="/cashmel/details/:id"
          element={<PrivateRoute><ModuleAccessGuard moduleName="rojmel"><CashMelDetails /></ModuleAccessGuard></PrivateRoute>}
        />

        <Route
          path="/cashmel/view/:id"
          element={<PrivateRoute><ModuleAccessGuard moduleName="rojmel"><CashMelView /></ModuleAccessGuard></PrivateRoute>}
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
          element={<PrivateRoute><ChangePassword /></PrivateRoute>}
        />

        <Route
          path="/payment"
          element={<PrivateRoute><Payment /></PrivateRoute>}
        />


      </Routes>
    </BrowserRouter>
  );
}
