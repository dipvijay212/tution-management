export const APP_CONFIG = {
  NAME: 'TuitionPro',
  VERSION: '1.0.0',
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
};

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  STUDENTS: '/students',
  COURSES: '/courses',
  SETTINGS: '/settings',
  LOGIN: '/login',
  SIGNUP: '/signup',
};

export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
};
