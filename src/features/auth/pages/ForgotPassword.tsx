import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/core/router/routes';
import apiClient from '@/core/api/client';
import { useState } from 'react';

const schema = z.object({ email: z.string().email('Invalid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const onSubmit = async (data: FormData) => {
    await apiClient.post('/auth/forgot-password', data);
    setSent(true);
  };
  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Paper elevation={4} sx={{ p: 4, width: 380, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} mb={1}>Forgot password</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>Enter your email and we'll send a reset link.</Typography>
        {sent ? (
          <Alert severity="success">Check your email for a reset link. (Check the MSW console for the token.)</Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField label="Email" fullWidth sx={{ mb: 2 }} {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
            <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>{isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Send reset link'}</Button>
          </Box>
        )}
        <Typography variant="caption" display="block" textAlign="center" mt={2}><Link to={ROUTES.LOGIN} style={{ color: 'inherit' }}>Back to login</Link></Typography>
      </Paper>
    </Box>
  );
}
