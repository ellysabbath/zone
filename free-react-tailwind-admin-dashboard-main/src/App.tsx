// import { BrowserRouter as Router, Routes, Route } from "react-router";
// import SignIn from "./pages/AuthPages/SignIn";
// import SignUp from "./pages/AuthPages/SignUp";
// import NotFound from "./pages/OtherPage/NotFound";
// import UserProfiles from "./pages/UserProfiles";
// import Videos from "./pages/UiElements/Videos";
// import Images from "./pages/UiElements/Images";
// import Alerts from "./pages/UiElements/Alerts";
// import Badges from "./pages/UiElements/Badges";
// import Ministries from "./pages/UiElements/Avatars";
// import Buttons from "./pages/UiElements/Buttons";
// import LineChart from "./pages/Charts/LineChart";
// import BarChart from "./pages/Charts/BarChart";
// import Calendar from "./pages/Calendar";
// import BasicTables from "./pages/Tables/BasicTables";
// import FormElements from "./pages/Forms/FormElements";
// import Blank from "./pages/Blank";
// import AppLayout from "./layout/AppLayout";
// import { ScrollToTop } from "./components/common/ScrollToTop";
// import Home from "./pages/Dashboard/Home";
// import Landing from "./Landing";
// import RequestPasswordReset from "./pages/Auth/RequestPasswordReset";
// import VerifyOTP from "./pages/Auth/VerifyOTP";
// import ResetPassword from "./pages/Auth/ResetPassword";
// import District from "./pages/Custom/district";
// import Collages from "./pages/Custom/Collages";
// import Members from "./pages/Custom/members";
// import BranchTimetables from "./pages/Forms/BranchTimetables";
// import Image from "./pages/Images";
// import Treasurer from "./pages/Custom/Treasurer";
// import Add from "./pages/Auth/add";
// import Chat from "./components/header/Chat";
// import APTEC from "./components/header/APTEC";



// export default function App() {
//   return (
//     <>
//       <Router>
//         <ScrollToTop />
//         <Routes>
//           {/* Dashboard Layout */}
//           <Route path="/" element={<Landing />} />
//           <Route path="/chat" element={<Chat />} />
//           <Route path="/request-password-reset" element={<RequestPasswordReset />} />
//            <Route path="/verify-otp" element={<VerifyOTP />} />
//            <Route path="/reset-password" element={<ResetPassword />} />
//           <Route element={<AppLayout />}>
//             <Route index path="/dashboard" element={<Home />} />


//             {/* Others Page */}
//              <Route path="/images" element={<Image />} />
//             <Route path="/profile" element={<UserProfiles />} />
//             <Route path="/calendar" element={<Calendar />} />
//             <Route path="/library" element={<Blank />} />
//                 <Route path="/district" element={<District />} />
//             {/* Forms */}
//             <Route path="/timetable-zone" element={<FormElements />} />
//             <Route path="/members" element={<Members />} />
//             <Route path="/treasurer" element={<Treasurer />} />
//             <Route path="/aptec" element={<APTEC />} />
      

//             {/* Tables */}
//             <Route path="/basic-tables" element={<BasicTables />} />
//            <Route path="/collage" element={<Collages />} />

//             {/* Ui Elements */}
//             <Route path="/alerts" element={<Alerts />} />
//             <Route path="/ministries" element={<Ministries />} />
//             <Route path="/badge" element={<Badges />} />
//             <Route path="/buttons" element={<Buttons />} />
//             <Route path="/images" element={<Images />} />
//             <Route path="/videos" element={<Videos />} />
//             <Route path="/timetable-branch" element={<BranchTimetables/>} />
//             <Route path="/manage" element={<Add/>} />

//             {/* Charts */}
//             <Route path="/line-chart" element={<LineChart />} />
//             <Route path="/bar-chart" element={<BarChart />} />
//           </Route>

//           {/* Auth Layout */}
//           <Route path="/signin" element={<SignIn />} />
//           <Route path="/signup" element={<SignUp />} />

//           {/* Fallback Route */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </Router>
//     </>
//   );
// }





// Updated App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./context/ProtectedRoute";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Ministries from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Landing from "./Landing";
import RequestPasswordReset from "./pages/Auth/RequestPasswordReset";
import VerifyOTP from "./pages/Auth/VerifyOTP";
import ResetPassword from "./pages/Auth/ResetPassword";
import District from "./pages/Custom/district";
import Collages from "./pages/Custom/Collages";
import Members from "./pages/Custom/members";
import BranchTimetables from "./pages/Forms/BranchTimetables";
import Image from "./pages/Images";
import Treasurer from "./pages/Custom/Treasurer";
import Add from "./pages/Auth/add";
import Chat from "./components/header/Chat";
import APTEC from "./components/header/APTEC";
import MinistriesUser from "./pages/UiElements/MinistryUser";
import ImageUser from "./pages/ImageUser";
import LibraryUser from "./pages/LibraryUser";
import BranchUserTimetable from "./pages/Forms/BranchUserTimetable";
import ZoneTimetable from "../src/components/form/form-elements/ZoneTimetable";
import UserCalendar from "../src/pages/UserCalendar";
import UserHome from "./pages/Dashboard/UserHome";
import UserTreasurer from "./pages/Custom/UserTreasurer";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute public>
                <Chat />
              </ProtectedRoute>
            } 
          />
          <Route path="/request-password-reset" element={<RequestPasswordReset />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          {/* <Route
           path="/user-calendar" 
           element={
            <ProtectedRoute requiredRoles={['user']}>
           < UserCalendar/>
           </ProtectedRoute>
           
           } /> */}


          {/* Protected Routes with AppLayout */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } 
          >
            {/* Dashboard - accessible to all authenticated users */}
            <Route path="dashboard" element={<Home />} />

            {/* User-only routes */}
            <Route 
              path="profile" 
              element={
                <ProtectedRoute requiredRoles={['user', 'admin']}>
                  <UserProfiles />
                </ProtectedRoute>
              } 
            />

               <Route 
              path="ministry-user" 
              element={
                <ProtectedRoute requiredRoles={['user']}>
                  <MinistriesUser />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="user-dashboard" 
              element={
                <ProtectedRoute requiredRoles={['user']}>
                  <UserHome />
                </ProtectedRoute>
              } 
            />
            
               <Route 
              path="images-user" 
              element={
                <ProtectedRoute requiredRoles={['user']}>
                  <ImageUser />
                </ProtectedRoute>
              } 
            />

          <Route 
              path="user-calendar" 
              element={
                <ProtectedRoute requiredRoles={['user']}>
                  <UserCalendar/>
                </ProtectedRoute>
              } 
            />

          <Route 
              path="user-treasurer" 
              element={
                <ProtectedRoute requiredRoles={['user']}>
                  <UserTreasurer/>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="calendar" 
              element={
                
                  <Calendar />
               
              } 
            />
            <Route 
              path="library" 
              element={
              
                  <Blank />
               
              } 
            />
            <Route 
              path="library-user" 
              element={
                <ProtectedRoute requiredRoles={['user']}>
                  <LibraryUser />
                </ProtectedRoute>
              } 
            />









            <Route 
              path="images" 
              element={
                
                  <Image />
               
              } 
            />

            {/* Admin-only routes */}
            <Route 
              path="district" 
              element={
               
                  <District />
               
              } 
            />
            <Route 
              path="members" 
              element={
               
                  <Members />
             
              } 
            />
            <Route 
              path="user lists" 
              element={
               
                  <BasicTables />
               
              } 
            />
            <Route 
              path="treasurer" 
              element={
                
                  <Treasurer />
                
              } 
            />
            <Route 
              path="collage" 
              element={
                // <ProtectedRoute requiredRoles={['admin']}>
                  <Collages />
                // </ProtectedRoute>
              } 
            />
            <Route 
              path="manage" 
              element={
                // <ProtectedRoute requiredRoles={['admin']}>
                  <Add />
                // </ProtectedRoute>
              } 
            />
         <Route 
              path="timetable-branch" 
              element={
                // <ProtectedRoute requiredRoles={['admin']}>
                  <BranchTimetables />
                // </ProtectedRoute>
              } 
          />
        <Route 
              path="user-timetable-branch" 
              element={
                <ProtectedRoute requiredRoles={['user']}>
                  <BranchUserTimetable />
                </ProtectedRoute>
              } 
          />
            <Route 
              path="aptec" 
              element={
              
                  <APTEC />
               
              } 
            />

            {/* Other routes */}
            <Route
             path="timetable-zone"
              element={
              // <ProtectedRoute requiredRoles={['admin']}>
              <FormElements />
              // </ProtectedRoute>
              } />
            <Route path="user-timetable-zone" 
            element={
              <ProtectedRoute requiredRoles={['user']}>
              <ZoneTimetable />
              </ProtectedRoute>
              } />
            <Route path="alerts" element={<Alerts />} />
            <Route path="ministries" element={<Ministries />} />
            <Route path="badge" element={<Badges />} />
            <Route path="buttons" element={<Buttons />} />
            <Route path="images" element={<Images />} />
            <Route path="videos" element={<Videos />} />
           
            <Route path="line-chart" element={<LineChart />} />
            <Route path="bar-chart" element={<BarChart />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}