import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import DashboardLayout from './admin/layout/DashboardLayout';
import RequireAdminAuth from './admin/auth/RequireAdminAuth';
import AdminLogin from './admin/pages/AdminLogin';
import CourseList from './admin/pages/CourseList';
import CreateCourse from './admin/pages/CreateCourse';
import CreateInstitute from './admin/pages/CreateInstitute';
import InstituteList from './admin/pages/InstituteList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          element={
            <RequireAdminAuth>
              <DashboardLayout />
            </RequireAdminAuth>
          }
        >
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
