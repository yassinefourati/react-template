import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/core/router/routes';
import apiClient from '@/core/api/client';

const schema = z.object({ password: z.string().min(8,'Min 8 characters'), confirm: z.string() }).refine((d) => d.password === d.confirm, { message:"Passwords don't match", path:['confirm'] });
type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const onSubmit = async (data: FormData) => {
    try {
      await apiClient.post('/auth/reset-password', { token, password: data.password });
      navigate(ROUTES.LOGIN);
    } catch (e: unknown) {
      setError('root', { message: e instanceof Error ? e.message : 'Reset failed' });
    }
  };
  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Paper elevation={4} sx={{ p: 4, width: 380, borderRadius: 3 }} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h5" fontWeight={700} mb={3}>Reset password</Typography>
        {errors.root && <Alert severity="error" sx={{ mb: 2 }}>{errors.root.message}</Alert>}
        <TextField label="New password" type="password" fullWidth sx={{ mb: 2 }} {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
        <TextField label="Confirm password" type="password" fullWidth sx={{ mb: 3 }} {...register('confirm')} error={!!errors.confirm} helperText={errors.confirm?.message} />
        <Button type="submit" variant="contained" fullWidth disabled={isSubmitting || !token}>{isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Reset password'}</Button>
      </Paper>
    </Box>
  );
}
