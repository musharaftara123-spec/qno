import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { SocketProvider } from './contexts/SocketContext.jsx'
import { ClinicAuthProvider } from './contexts/ClinicAuthContext.jsx'

// Patient App Pages
import PatientLanding from './pages/patient/PatientLanding.jsx'
import PatientHome from './pages/patient/PatientHome.jsx'
import ClinicSelect from './pages/patient/ClinicSelect.jsx'
import ClinicDetail from './pages/patient/ClinicDetail.jsx'
import DoctorSelect from './pages/patient/DoctorSelect.jsx'
import BookAppointment from './pages/patient/BookAppointment.jsx'
import Payment from './pages/patient/Payment.jsx'
import PaymentSuccess from './pages/patient/PaymentSuccess.jsx'
import PatientQueueView from './pages/patient/PatientQueueView.jsx'

// Clinic Portal Pages
import ClinicLogin from './pages/clinic/ClinicLogin.jsx'
import ClinicRegister from './pages/clinic/ClinicRegister.jsx'
import ClinicDashboard from './pages/clinic/ClinicDashboard.jsx'
import QueueManagement from './pages/clinic/QueueManagement.jsx'
import ClinicProfile from './pages/clinic/ClinicProfile.jsx'
import Appointments from './pages/clinic/Appointments.jsx'
import ProtectedClinicRoute from './components/clinic/ProtectedClinicRoute.jsx'
import ClinicDoctors from './pages/clinic/ClinicDoctors.jsx'
import Patients from './pages/clinic/Patients.jsx'

// About Pages
import AboutDeveloper from './pages/AboutDeveloper.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <ClinicAuthProvider>
          <Toaster position="top-center" />
          <Routes>
            {/* Patient Routes */}
            <Route path="/" element={<PatientLanding />} />
            <Route path="/patient-home" element={<PatientHome />} />
            <Route path="/clinics" element={<ClinicSelect />} />
            <Route path="/clinic/:clinicId" element={<ClinicDetail />} />
            <Route path="/clinic/:clinicId/doctors" element={<DoctorSelect />} />
            <Route
              path="/clinic/:clinicId/doctor/:doctorId/book"
              element={<BookAppointment />}
            />
            <Route path="/appointment/:appointmentId/payment" element={<Payment />} />
            <Route path="/appointment/:appointmentId/success" element={<PaymentSuccess />} />
            <Route path="/appointment/:appointmentId/queue" element={<PatientQueueView />} />
            <Route path="/queue/:appointmentId" element={<PatientQueueView />} />

            {/* Clinic Portal Routes */}
            <Route path="/clinic-login" element={<ClinicLogin />} />
            <Route path="/clinic/register" element={<ClinicRegister />} />
            <Route
              path="/clinic/dashboard"
              element={
                <ProtectedClinicRoute>
                  <ClinicDashboard />
                </ProtectedClinicRoute>
              }
            />
            <Route
              path="/clinic/queue"
              element={
                <ProtectedClinicRoute>
                  <QueueManagement />
                </ProtectedClinicRoute>
              }
            />
            <Route
              path="/clinic/appointments"
              element={
                <ProtectedClinicRoute>
                  <Appointments />
                </ProtectedClinicRoute>
              }
            />
            <Route
              path="/clinic/settings"
              element={
                <ProtectedClinicRoute>
                  <ClinicProfile />
                </ProtectedClinicRoute>
              }
            />
            <Route
              path="/clinic/doctors"
              element={
                <ProtectedClinicRoute>
                  <ClinicDoctors />
                </ProtectedClinicRoute>
              }
            />
            <Route path="/clinic/patients" element={<ProtectedClinicRoute><Patients /></ProtectedClinicRoute>} />

            {/* About Routes */}
            <Route path="/about-developer" element={<AboutDeveloper />} />
          </Routes>
        </ClinicAuthProvider>
      </SocketProvider>
    </ThemeProvider>
  )
}