import { Toaster } from '@/components/ui/sonner';
import { useAdminAuth } from '@/admin/useAdminAuth';
import AdminLogin from '@/admin/AdminLogin';
import AdminDashboard from '@/admin/AdminDashboard';

export default function AdminApp() {
  const { autenticado, carregando } = useAdminAuth();

  if (carregando) {
    return <div className="min-h-[100dvh] bg-background" />;
  }

  return (
    <>
      <Toaster theme="dark" />
      {autenticado ? <AdminDashboard /> : <AdminLogin />}
    </>
  );
}
