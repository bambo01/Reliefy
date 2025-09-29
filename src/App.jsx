import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import LandingPage from "./Public/Pages/LandingPage";
import AdminLogIn from "./Admin/Pages/AdminLogIn";
import AdminRootLayout from "./Admin/AdminRootLayout";
import PublicRootLayout from "./Public/PublicRootLayout";
import AdminDashboard from "./Admin/Pages/AdminDashboard";
import AdminBatches from "./Admin/Pages/AdminBatches";
import AdminDistributions from "./Admin/Pages/AdminDistributions";
import PublicDashboard from "./Public/Pages/PublicDashboard";
import Explorer from "./Public/Pages/Explorer";
import ProofPage from "./Public/Pages/ProofPage";







function App() {




  return (
    <BrowserRouter>
     <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/login" element={<AdminLogIn />} />
       


        {/* Admin routes with AdminLayout */}
        <Route path="/admin" element={<AdminRootLayout />}>
          <Route index element={<AdminDashboard />} />
           <Route path="batches" element={<AdminBatches />} />
            <Route path="distributions" element={<AdminDistributions />} />
        
        </Route>


        {/* User routes with UserLayout */}
        <Route path="/public" element={<PublicRootLayout />}>
         <Route index element={<Explorer />} />
           
             <Route path="proof/:distributionId" element={<ProofPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


export default App;
