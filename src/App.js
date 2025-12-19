import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import DashboardLayout from './admin/layout/DashboardLayout';
import RequireAdminAuth from './admin/auth/RequireAdminAuth';
import AdminLogin from './admin/pages/AdminLogin';
import CourseList from './admin/pages/CourseList';
import CreateCourse from './admin/pages/CreateCourse';
import CreateInstitute from './admin/pages/CreateInstitute';
import InstituteList from './admin/pages/InstituteList';

/**
 * App-level routing.
 *
 * WHY we keep routing here:
 * - It is the "map" of the application.
 * - Keeping it explicit makes it easier to reason about navigation flows.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route: admin login. */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* All other routes are admin-only and share one common layout. */}
        <Route
          element={
            <RequireAdminAuth>
              <DashboardLayout />
            </RequireAdminAuth>
          }
        >
          {/* Default redirect when the user lands on "/". */}
          <Route index element={<Navigate to="/institutes" replace />} />

          {/* Institute routes */}
          <Route path="/institutes" element={<InstituteList />} />
          <Route path="/institutes/create" element={<CreateInstitute />} />
          <Route path="/institutes/create/:step" element={<CreateInstitute />} />
          <Route path="/institutes/:id/edit" element={<CreateInstitute />} />
          <Route path="/institutes/:id/edit/:step" element={<CreateInstitute />} />

          {/* Course routes */}
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/create" element={<CreateCourse />} />
          <Route path="/courses/create/:step" element={<CreateCourse />} />
          <Route path="/courses/:id/edit" element={<CreateCourse />} />
          <Route path="/courses/:id/edit/:step" element={<CreateCourse />} />

          {/* Fallback: any unknown admin route redirects to institutes. */}
          <Route path="*" element={<Navigate to="/institutes" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
