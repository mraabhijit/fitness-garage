import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants/routes';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/forms/FormField';
import { User, KeyRound } from 'lucide-react';

export const MemberLoginPage: React.FC = () => {
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
      // In production, this calls supabase.auth.signInWithPassword
      // For demonstration / seed member authentication:
      const fakeToken = `mock-member-jwt-${Date.now()}`;
      setAuth(fakeToken, {
        id: '11111111-1111-1111-1111-111111111111',
        email: email || 'member@example.com',
        role: 'member',
      });
      navigate(ROUTES.MEMBER_DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 border-garage-mid">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-garage-chrome/10 border border-garage-chrome/30 flex items-center justify-center mx-auto mb-4 text-garage-chrome">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-display uppercase tracking-wider text-garage-white">
            MEMBER <span className="text-garage-chrome">/</span> PORTAL
          </h2>
          <p className="text-xs text-garage-muted mt-1">
            Access your membership status, renewal dates, and payment receipts.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-status-expired/10 border border-status-expired/30 rounded-lg text-xs text-status-expired text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <FormField
            label="Email or Phone"
            type="text"
            required
            placeholder="member@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <FormField
            label="Password or Access PIN"
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
            leftIcon={<KeyRound className="w-4 h-4" />}
          >
            Sign In to Portal
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-garage-mid text-center text-xs text-garage-muted space-y-2">
          <p>
            Need help? Contact gym front desk at{' '}
            <span className="text-garage-white font-semibold">+91 98765 43210</span>
          </p>
          <p>
            Are you gym staff?{' '}
            <Link to={ROUTES.ADMIN_LOGIN} className="text-garage-chrome hover:underline font-bold">
              Staff Portal Login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};
