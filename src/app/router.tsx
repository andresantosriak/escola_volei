import { createBrowserRouter } from 'react-router-dom'
import { AppLayout, FocusLayout } from '@/components/layouts/AppLayout'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/auth/ProtectedRoute'

import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import Home from '@/pages/Home'
import Menu from '@/pages/Menu'
import NotFound from '@/pages/NotFound'

import Branches from '@/pages/manage/Branches'
import BranchDetail from '@/pages/manage/BranchDetail'
import Classes from '@/pages/manage/Classes'
import ClassDetail from '@/pages/manage/ClassDetail'
import Skills from '@/pages/manage/Skills'
import Settings from '@/pages/manage/Settings'

import StudentList from '@/pages/students/StudentList'
import StudentDetail from '@/pages/students/StudentDetail'

import Attendance from '@/pages/training/Attendance'
import BuildTeams from '@/pages/training/BuildTeams'
import RegisterResult from '@/pages/training/RegisterResult'
import EvaluatePlayer from '@/pages/training/EvaluatePlayer'

import MatchHistory from '@/pages/history/MatchHistory'
import MatchDetail from '@/pages/history/MatchDetail'

import ShareCard from '@/pages/share/ShareCard'

import Showcase from '@/pages/Showcase'

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
    ],
  },
  // reset-password é acessível mesmo logado (vem de link de e-mail)
  { path: '/reset-password', element: <ResetPassword /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/menu', element: <Menu /> },
          { path: '/history', element: <MatchHistory /> },
          { path: '/students', element: <StudentList /> },
        ],
      },
      {
        element: <FocusLayout />,
        children: [
          { path: '/history/:id', element: <MatchDetail /> },
          { path: '/students/new', element: <StudentDetail /> },
          { path: '/students/:id', element: <StudentDetail /> },
          { path: '/manage/branches', element: <Branches /> },
          { path: '/manage/branches/new', element: <BranchDetail /> },
          { path: '/manage/branches/:id', element: <BranchDetail /> },
          { path: '/manage/classes', element: <Classes /> },
          { path: '/manage/classes/new', element: <ClassDetail /> },
          { path: '/manage/classes/:id', element: <ClassDetail /> },
          { path: '/manage/skills', element: <Skills /> },
          { path: '/manage/settings', element: <Settings /> },
          { path: '/share', element: <ShareCard /> },
          { path: '/training/attendance', element: <Attendance /> },
          { path: '/training/teams', element: <BuildTeams /> },
          { path: '/training/result', element: <RegisterResult /> },
          { path: '/training/evaluate', element: <EvaluatePlayer /> },
        ],
      },
    ],
  },

  // rota só de DEV p/ auditoria visual do design system (fora do bundle de produção)
  ...(import.meta.env.DEV ? [{ path: '/__showcase', element: <Showcase /> }] : []),

  { path: '*', element: <NotFound /> },
], {
  future: {
    v7_relativeSplatPath: true,
  },
})
