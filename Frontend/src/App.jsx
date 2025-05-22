import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from "./pages/Login";


import Dashboard from './components/Dashboard';
import LocationManagement from './components/LocationManagement';


function App() {

  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard/>}>
          <Route path="location-management" element={<LocationManagement />} />
          <Route index element={<Navigate to="location-management" replace />} /> 
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;