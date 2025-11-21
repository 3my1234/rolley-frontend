import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Shield } from 'lucide-react';
import { apiClient } from '../../lib/api';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const clearAdminToken = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('adminToken');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkAdminAuth = async () => {
      if (location.pathname === '/admin/login') {
        if (isMounted) {
          setIsLoading(false);
          setIsAuthenticated(false);
        }
        return;
      }

      try {
        const session = await apiClient.adminSession();

        if (!isMounted) {
          return;
        }

        if (session?.admin) {
          setIsAuthenticated(true);
          setAdminEmail(session.admin.email || null);
        } else {
          clearAdminToken();
          setIsAuthenticated(false);
          navigate('/admin/login', { replace: true });
        }
      } catch (error) {
        if (isMounted) {
          clearAdminToken();
          setIsAuthenticated(false);
          navigate('/admin/login', { replace: true });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAdminAuth();

    return () => {
      isMounted = false;
    };
  }, [location.pathname, navigate]);

  const handleLogout = async () => {
    try {
      await apiClient.adminLogout();
    } catch (error) {
      // ignore
    }

    clearAdminToken();

    setIsAuthenticated(false);
    setAdminEmail(null);
    navigate('/admin/login', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purple-200">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return location.pathname === '/admin/login' ? <Outlet /> : null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Rolley Admin</h1>
                <p className="text-xs text-purple-300">Control Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {adminEmail && (
                <div className="hidden sm:block text-right">
                  <p className="text-sm text-white font-medium">{adminEmail}</p>
                  <p className="text-xs text-purple-300">Administrator</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-200 hover:text-white transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
