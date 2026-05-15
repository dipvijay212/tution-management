import ProtectedRoute from "@/components/layout/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function TeacherLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

