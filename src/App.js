import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './styles/dashboard.css';

import DashboardLayout from './components/layout/DashboardLayout';
import CourseList from './pages/CourseList';
import CreateCourse from './pages/CreateCourse';
import CreateInstitute from './pages/CreateInstitute';
import InstituteList from './pages/InstituteList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/institutes" replace />} />
          <Route path="/institutes" element={<InstituteList />} />
          <Route path="/institutes/create" element={<CreateInstitute />} />
          <Route path="/institutes/create/:step" element={<CreateInstitute />} />
          <Route path="/institutes/:id/edit" element={<CreateInstitute />} />
          <Route path="/institutes/:id/edit/:step" element={<CreateInstitute />} />

          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/create" element={<CreateCourse />} />
          <Route path="/courses/create/:step" element={<CreateCourse />} />
          <Route path="/courses/:id/edit" element={<CreateCourse />} />
          <Route path="/courses/:id/edit/:step" element={<CreateCourse />} />

          <Route path="*" element={<Navigate to="/institutes" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
