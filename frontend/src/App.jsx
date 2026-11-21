import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import CourseDetail from './pages/CourseDetail'
import ClassDetail from './pages/ClassDetail'
import Team from './pages/Team'
import Terms from './pages/Terms'
import BrandAmbassador from './pages/BrandAmbassador'
import Tools from './pages/Tools'
import Worksheet from './pages/Worksheet'
import ScreenRecording from './pages/ScreenRecording'
import FlashAnzan from './pages/FlashAnzan'
import VirtualAbacus from './pages/VirtualAbacus'
import LoginPage from './pages/Login'
import StudentSignup from './pages/StudentSignup'
import StudentProfile from './pages/StudentProfile'
import Homework from './pages/Homework'
import HomeworkAttempt from './pages/HomeworkAttempt'
import { RequireStudent, RequireBatch, RequireToolAccess } from './components/studentGuards'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminCourses from './pages/admin/AdminCourses'
import CourseForm from './pages/admin/CourseForm'
import Roles from './pages/admin/Roles'
import RoleForm from './pages/admin/RoleForm'
import Users from './pages/admin/Users'
import AdminTeam from './pages/admin/AdminTeam'
import TeamForm from './pages/admin/TeamForm'
import AdminBrandAmbassador from './pages/admin/AdminBrandAmbassador'
import BrandAmbassadorForm from './pages/admin/BrandAmbassadorForm'
import AdminMessages from './pages/admin/AdminMessages'
import AdminClassVideo from './pages/admin/AdminClassVideo'
import AdminBatches from './pages/admin/AdminBatches'
import BatchForm from './pages/admin/BatchForm'
import AdminStudents from './pages/admin/AdminStudents'
import StudentForm from './pages/admin/StudentForm'
import AdminHomework from './pages/admin/AdminHomework'
import HomeworkForm from './pages/admin/HomeworkForm'
import HomeworkDetail from './pages/admin/HomeworkDetail'
import Contact from './pages/Contact'
import ClassVideo from './pages/ClassVideo'
import NotFound from './pages/NotFound'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PermissionRoute({ module, children }) {
  const { hasPermission, isSuperAdmin, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!isSuperAdmin && !hasPermission(module, 'read')) return <Navigate to="/admin" replace />
  return children
}

const modulePathMap = {
  'courses': '/admin/courses',
  'team': '/admin/team',
  'brand-ambassador': '/admin/brand-ambassador',
  'contact': '/admin/messages',
  'class-video': '/admin/class-video',
  'batches': '/admin/batches',
  'students': '/admin/students',
  'homework': '/admin/homework',
  'users': '/admin/users',
  'roles': '/admin/roles',
}

function DashboardRoute() {
  return <Dashboard />
}

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="courses/:slug" element={<CourseDetail />} />
        <Route path="courses/:slug/class/:idx" element={<ClassDetail />} />
        <Route path="team" element={<Team />} />
        <Route path="terms" element={<Terms />} />
        <Route path="brand-ambassador" element={<BrandAmbassador />} />
        <Route path="contact" element={<Contact />} />
        {/* Unified auth — one login for admins/staff and students */}
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<StudentSignup />} />
        <Route path="profile" element={<RequireStudent><StudentProfile /></RequireStudent>} />

        {/* Tools — require login; signup students get abacus only */}
        <Route path="tools" element={<RequireStudent><Tools /></RequireStudent>} />
        <Route path="tools/virtual-abacus" element={<RequireToolAccess toolId="virtual-abacus"><VirtualAbacus /></RequireToolAccess>} />
        <Route path="tools/worksheet" element={<RequireToolAccess toolId="worksheet"><Worksheet /></RequireToolAccess>} />
        <Route path="tools/screen-recording" element={<RequireToolAccess toolId="screen-recording"><ScreenRecording /></RequireToolAccess>} />
        <Route path="tools/flash-anzan" element={<RequireToolAccess toolId="flash-anzan"><FlashAnzan /></RequireToolAccess>} />

        {/* Homework — enrolled (batch) students only */}
        <Route path="homework" element={<RequireBatch><Homework /></RequireBatch>} />
        <Route path="homework/:id" element={<RequireBatch><HomeworkAttempt /></RequireBatch>} />

        <Route path="class-video" element={<ClassVideo />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin — the old admin login URL now points at the unified login */}
      <Route path="admin/login" element={<Navigate to="/login" replace />} />
      <Route path="admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<DashboardRoute />} />
        <Route path="courses" element={<PermissionRoute module="courses"><AdminCourses /></PermissionRoute>} />
        <Route path="courses/new" element={<PermissionRoute module="courses"><CourseForm /></PermissionRoute>} />
        <Route path="courses/:id/edit" element={<PermissionRoute module="courses"><CourseForm /></PermissionRoute>} />
        <Route path="team" element={<PermissionRoute module="team"><AdminTeam /></PermissionRoute>} />
        <Route path="team/new" element={<PermissionRoute module="team"><TeamForm /></PermissionRoute>} />
        <Route path="team/:id/edit" element={<PermissionRoute module="team"><TeamForm /></PermissionRoute>} />
        <Route path="brand-ambassador" element={<PermissionRoute module="brand-ambassador"><AdminBrandAmbassador /></PermissionRoute>} />
        <Route path="brand-ambassador/new" element={<PermissionRoute module="brand-ambassador"><BrandAmbassadorForm /></PermissionRoute>} />
        <Route path="brand-ambassador/:id/edit" element={<PermissionRoute module="brand-ambassador"><BrandAmbassadorForm /></PermissionRoute>} />
        <Route path="messages" element={<PermissionRoute module="contact"><AdminMessages /></PermissionRoute>} />
        <Route path="class-video" element={<PermissionRoute module="class-video"><AdminClassVideo /></PermissionRoute>} />
        <Route path="batches" element={<PermissionRoute module="batches"><AdminBatches /></PermissionRoute>} />
        <Route path="batches/new" element={<PermissionRoute module="batches"><BatchForm /></PermissionRoute>} />
        <Route path="batches/:id/edit" element={<PermissionRoute module="batches"><BatchForm /></PermissionRoute>} />
        <Route path="students" element={<PermissionRoute module="students"><AdminStudents /></PermissionRoute>} />
        <Route path="students/new" element={<PermissionRoute module="students"><StudentForm /></PermissionRoute>} />
        <Route path="students/:id/edit" element={<PermissionRoute module="students"><StudentForm /></PermissionRoute>} />
        <Route path="homework" element={<PermissionRoute module="homework"><AdminHomework /></PermissionRoute>} />
        <Route path="homework/new" element={<PermissionRoute module="homework"><HomeworkForm /></PermissionRoute>} />
        <Route path="homework/:id" element={<PermissionRoute module="homework"><HomeworkDetail /></PermissionRoute>} />
        <Route path="homework/:id/edit" element={<PermissionRoute module="homework"><HomeworkForm /></PermissionRoute>} />
        <Route path="roles" element={<PermissionRoute module="roles"><Roles /></PermissionRoute>} />
        <Route path="roles/new" element={<PermissionRoute module="roles"><RoleForm /></PermissionRoute>} />
        <Route path="roles/:id/edit" element={<PermissionRoute module="roles"><RoleForm /></PermissionRoute>} />
        <Route path="users" element={<PermissionRoute module="users"><Users /></PermissionRoute>} />
      </Route>
    </Routes>
  )
}
