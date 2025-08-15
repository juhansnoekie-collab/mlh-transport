import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { Truck } from 'lucide-react';

const Login: React.FC = () => {
  const { user, adminUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && adminUser) {
      navigate('/admin');
    }
  }, [user, adminUser, loading, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-2xl font-bold text-primary">
            <Truck className="h-8 w-8" />
            <span>MLH Transport</span>
          </Link>
          <p className="text-muted-foreground mt-2">Admin Dashboard Login</p>
        </div>

        <LoginForm />

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;