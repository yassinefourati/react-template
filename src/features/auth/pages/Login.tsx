import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert, LinearProgress, FormControlLabel, Checkbox, InputAdornment } from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/core/auth/stores/useAuthStore';
import { ROUTES } from '@/core/router/routes';
import { loginSchema, type LoginFormData } from '../schemas/loginSchema';
import { env } from '@/core/config/env';

function useCountdown(lockedUntil: number | null, onExpire: () => void) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!lockedUntil) return;
    // Initial value set via the callback form — not synchronously in the effect body
    const interval = setInterval(() => {
      setSeconds(() => {
        const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
        if (remaining === 0) { clearInterval(interval); onExpire(); }
        return remaining;
      });
    }, 250); // 250ms for responsive first render
    return () => clearInterval(interval);
  }, [lockedUntil, onExpire]);

  return seconds;
}

export default function Login() {
  const { login, isLoading, failedAttempts, lockedUntil, resetLockout } = useAuthStore();
  const navigate = useNavigate();
  const { t }    = useTranslation();

  const countdown    = useCountdown(lockedUntil, resetLockout);
  const isLocked     = Boolean(lockedUntil) && countdown > 0;
  const attemptsLeft = Math.max(0, env.VITE_LOGIN_MAX_ATTEMPTS - failedAttempts);

  const { register, handleSubmit, setError, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@demo.com', password: 'password' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate(ROUTES.HOME);
    } catch (e: unknown) {
      setError('root', { message: e instanceof Error ? e.message : 'Login failed' });
    }
  };

  return (
    <Box sx={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 45%, #0d3f74 100%)',
      p: 2,
    }}>
      <Paper elevation={0} component="form" onSubmit={handleSubmit(onSubmit)} sx={{
        p: { xs: 3, sm: 5 }, width: 400, borderRadius: 4,
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
      }}>
        <Box sx={{
          width: 52, height: 52, borderRadius: 2.5, mb: 2.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #1976d2, #1565c0)',
          boxShadow: '0 6px 16px rgba(25,118,210,0.4)',
        }}>
          <DashboardRoundedIcon sx={{ color: '#fff', fontSize: 28 }} />
        </Box>

        <Typography variant="h5" fontWeight={800}>{t('auth.signIn')}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Welcome back — enter your details to continue.
        </Typography>

        {isLocked && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            Account locked. Try again in <strong>{countdown}s</strong>.
            <LinearProgress variant="determinate" value={(countdown / 60) * 100} color="error" sx={{ mt: 1, borderRadius: 1 }} />
          </Alert>
        )}

        {!isLocked && errors.root && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {errors.root.message}
            {failedAttempts > 0 && failedAttempts < env.VITE_LOGIN_MAX_ATTEMPTS && (
              <Typography variant="caption" display="block">
                {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining before lockout.
              </Typography>
            )}
          </Alert>
        )}

        <TextField label={t('auth.email')} fullWidth sx={{ mb: 2 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><MailOutlineRoundedIcon fontSize="small" color="action" /></InputAdornment> } }}
          {...register('email')} error={!!errors.email} helperText={errors.email?.message} disabled={isLocked} />
        <TextField label={t('auth.password')} type="password" fullWidth sx={{ mb: 1 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockOutlinedIcon fontSize="small" color="action" /></InputAdornment> } }}
          {...register('password')} error={!!errors.password} helperText={errors.password?.message} disabled={isLocked} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <FormControlLabel control={<Checkbox size="small" />} label={<Typography variant="caption">Remember me</Typography>} />
          <Link to={ROUTES.FORGOT_PASSWORD} style={{ fontSize: '0.8rem', color: 'inherit', opacity: 0.7 }}>
            Forgot password?
          </Link>
        </Box>

        <Button type="submit" variant="contained" fullWidth disabled={isLoading || isLocked}
          sx={{
            py: 1.2, borderRadius: 2, textTransform: 'none', fontSize: '0.95rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #1976d2, #1565c0)',
            boxShadow: '0 8px 20px rgba(25,118,210,0.35)',
            '&:hover': { background: 'linear-gradient(135deg, #1565c0, #0d3f74)' },
          }}>
          {isLoading ? <CircularProgress size={22} color="inherit" /> : t('auth.login')}
        </Button>
      </Paper>
    </Box>
  );
}
