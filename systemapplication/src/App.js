import './App.css';
import Register from './Components/SignUp';
import Login from './Login';
import GitHubAuth from './Components/GitHubAuth';
import Logout from './Components/Logout';
import SubscriptionManagement from './Components/SubscriptionManagement';
import VMManagement from './Components/VMManagement';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './Components/Home';
import PaymentPage from './Components/PaymentPage';
import PaymentDetailsForm from './Components/PaymentDetailsForm';
import AdminDashboard from './Components/AdminDashboard';
import UserDashboard from './Components/UserDashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import GoogleAuth from './Components/GoogleAUth';
import PaymentSystem from './Components/PaymentSystem';
import AdminPanel from './Components/AdminPanel';
import MultiClientManager from './Components/MultiClientManager';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect } from 'react';
import GuestHome from './Components/GuestHome';
import GuestDashboard from './Components/GuestDashboard';

function App() {
  function handleCallBackResponse(response) {
    console.log("Encoded JWT" + response.credential);
  }

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => {
        // Initialize Google Auth after the script is loaded
        window.google.accounts.id.initialize({
          client_id: "160983245449-fggfj9s37bcl9tbar1iemc8ii00c3muv.apps.googleusercontent.com",
          callback: handleCallBackResponse,
        });
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  return (
    <GoogleOAuthProvider clientId="160983245449-fggfj9s37bcl9tbar1iemc8ii00c3muv.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
       
          <Route path="/home" element={<HomePage />} />
          <Route path="/google" element={<GoogleAuth />} />
          <Route path="/github" element={<GitHubAuth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/subscription" element={<SubscriptionManagement />} />
          <Route path="/" element={<GuestHome />} />
          <Route path="/guest-dashboard" element={<GuestDashboard />} />



           <Route element={<ProtectedRoute role="Standard" />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/vm" element={<VMManagement />} />
            <Route path="/subscription" element={<SubscriptionManagement />} />
            <Route path="/client" element={<MultiClientManager />} />
          </Route>

          <Route element={<ProtectedRoute role="Guest" />}>
            <Route path="/guest-dashboard" element={<GuestDashboard />} />
            
          </Route>

        
          <Route element={<ProtectedRoute role="Admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/payments" element={<PaymentSystem />} />
            <Route path="/admin/panel" element={<AdminPanel />} />
          </Route>

          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-form" element={<PaymentDetailsForm />} />

         
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
