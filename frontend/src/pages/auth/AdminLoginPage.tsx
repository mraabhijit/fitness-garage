import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants/routes';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/forms/FormField';
import { ShieldCheck, Lock } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // In production, this verifies via Supabase Auth admin role JWT
      const fakeAdminToken = `mock-admin-jwt-${Date.now()}`;
      setAuth(fakeAdminToken, {
        id: '22222222-2222-2222-2222-222222222222',
        email: email || 'admin@fitnessgarage.com',
        role: 'admin',
      });
      navigate(ROUTES.ADMIN_DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 border-garage-mid shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-garage-chrome/10 border border-garage-chrome/30 flex items-center justify-center mx-auto mb-4 text-garage-chrome">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-display uppercase tracking-wider text-garage-white">
            ADMIN <span className="text-garage-chrome">/</span> CONTROL PLANE
          </h2>
          <p className="text-xs text-garage-muted mt-1">
            Restricted to Fitness Garage owners and staff.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-status-expired/10 border border-status-expired/30 rounded-lg text-xs text-status-expired text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <FormField
            label="Staff Email"
            type="email"
            required
            placeholder="admin@fitnessgarage.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <FormField
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isLoading}
            leftIcon={<Lock className="w-4 h-4" />}
          >
            Authenticate
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-garage-mid text-center text-xs text-garage-muted">
          <Link to={ROUTES.MEMBER_LOGIN} className="text-garage-muted hover:text-garage-white transition-colors">
            ← Back to Member Login
          </Link>
        </div>
      </Card>
    </div>
  );
};
