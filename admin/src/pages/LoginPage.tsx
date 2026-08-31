import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-4 py-12 font-sans selection:bg-black selection:text-white">
      <div className="w-full max-w-[420px] space-y-4">
        {/* shadcn/ui Card Container - Slightly enlarged */}
        <Card className="shadow-lg p-2">
          <CardHeader className="space-y-3 text-center pb-4">
            <div className="flex items-center justify-center gap-2 select-none mx-auto">
              <img src={`${import.meta.env.BASE_URL}images/common/logo.png`.replace(/\/+/g, '/')} alt="Awesome Handmade Logo" className="h-8 w-8 rounded-full object-cover border border-neutral-200" />
              <span className="text-xl font-bold tracking-tight text-neutral-900">Awesome Handmade <span className="text-xs text-neutral-500 font-semibold uppercase">Admin</span></span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Notification */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3.5">
                {/* Email Field */}
                <div>
                  <label className="text-sm font-medium text-neutral-800 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="text-neutral-400 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="Auth1-email"
                      type="email"
                      placeholder="Admin Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-10 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="text-sm font-medium text-neutral-800 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="text-neutral-400 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="Auth1-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-9 h-10 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-neutral-400 hover:text-black absolute top-1/2 right-3 -translate-y-1/2 transition-colors cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 text-sm font-medium group cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
