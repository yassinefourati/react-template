import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper, TextField, Button, Stack, Avatar, Chip, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, Alert, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import DevicesIcon from '@mui/icons-material/Devices';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '@/core/api/client';
import { useAuthStore } from '@/core/auth/stores/useAuthStore';
import { ROUTES } from '@/core/router/routes';
import { useNavigate } from 'react-router-dom';
import ProfileSkeleton from '@/shared/components/skeletons/ProfileSkeleton';
import { useProfile, useUpdateProfile, useChangePassword, useSessions, useRevokeSession, useRevokeAllSessions, useSetup2FA, useVerify2FA } from '../hooks/useProfile';
import { useConfirmStore } from '@/shared/stores/useConfirmStore';

const profileSchema = z.object({ name: z.string().min(2), email: z.string().email(), bio: z.string().optional(), phone: z.string().optional() });
const passwordSchema = z.object({ currentPassword: z.string().min(1,'Required'), newPassword: z.string().min(8,'Min 8 chars'), confirmPassword: z.string() }).refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });
type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

function TwoFASetup() {
  const { mutate: setup, data: setupData, isPending: settingUp } = useSetup2FA();
  const { mutate: verify, isPending: verifying } = useVerify2FA();
  const [code, setCode] = useState('');
  const [done, setDone] = useState(false);
  if (done) return <Alert severity="success">2FA is enabled. Save your backup codes safely.</Alert>;
  if (!setupData) return <Button variant="outlined" startIcon={<SecurityIcon />} onClick={() => setup()} disabled={settingUp}>Set up 2FA</Button>;
  return (
    <Stack spacing={2} maxWidth={360}>
      <Typography variant="body2">Scan this QR code with your authenticator app:</Typography>
      <Box component="img" src={setupData.qrCode} sx={{ width: 160, height: 160, border: '1px solid', borderColor: 'divider', borderRadius: 2 }} />
      <Typography variant="caption" color="text.secondary">Secret: <code>{setupData.secret}</code></Typography>
      <TextField label="Enter 6-digit code" value={code} onChange={(e) => setCode(e.target.value)} size="small" inputProps={{ maxLength: 6 }} />
      <Button variant="contained" disabled={code.length !== 6 || verifying} onClick={() => verify(code, { onSuccess: () => setDone(true) })}>
        {verifying ? <CircularProgress size={20} color="inherit" /> : 'Verify & Enable'}
      </Button>
      <Typography variant="caption" color="text.secondary">Demo: use code <strong>123456</strong></Typography>
    </Stack>
  );
}

export default function Profile() {
  const [tab, setTab] = useState(0);
  const { data: profile, isLoading } = useProfile();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: sessions } = useSessions();
  const { mutate: updateProfile, isPending: saving } = useUpdateProfile();
  const { mutate: changePassword, isPending: changingPwd, error: pwdError } = useChangePassword();
  const { mutate: revokeSession } = useRevokeSession();
  const { mutate: revokeAll } = useRevokeAllSessions();
  const { confirm } = useConfirmStore();

  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema), values: { name: profile?.name ?? '', email: profile?.email ?? '', bio: profile?.bio ?? '', phone: profile?.phone ?? '' } });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  if (isLoading) return <ProfileSkeleton />;

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem' }}>{profile?.name?.[0]}</Avatar>
        <Box><Typography variant="h4" fontWeight={700}>{profile?.name}</Typography><Chip label={profile?.role} size="small" color="primary" variant="outlined" /></Box>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="General" />
        <Tab label="Password" />
        <Tab label="2FA" />
        <Tab label="Sessions" icon={<DevicesIcon fontSize="small" />} iconPosition="start" />
      </Tabs>

      {tab === 0 && (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, maxWidth: 500 }} component="form" onSubmit={profileForm.handleSubmit((d) => updateProfile(d))}>
          <Stack spacing={2.5}>
            <TextField label="Name" {...profileForm.register('name')} error={!!profileForm.formState.errors.name} helperText={profileForm.formState.errors.name?.message} fullWidth />
            <TextField label="Email" {...profileForm.register('email')} error={!!profileForm.formState.errors.email} helperText={profileForm.formState.errors.email?.message} fullWidth />
            <TextField label="Bio" {...profileForm.register('bio')} multiline rows={3} fullWidth />
            <TextField label="Phone" {...profileForm.register('phone')} fullWidth />
            <Button type="submit" variant="contained" disabled={saving || !profileForm.formState.isDirty}>
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Save changes'}
            </Button>
          </Stack>
        </Paper>
      )}

      {tab === 1 && (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, maxWidth: 500 }} component="form" onSubmit={passwordForm.handleSubmit((d) => changePassword(d, { onSuccess: () => passwordForm.reset() }))}>
          <Stack spacing={2.5}>
            {pwdError && <Alert severity="error">{(pwdError as Error).message}</Alert>}
            <TextField label="Current password" type="password" {...passwordForm.register('currentPassword')} error={!!passwordForm.formState.errors.currentPassword} helperText={passwordForm.formState.errors.currentPassword?.message} fullWidth />
            <TextField label="New password" type="password" {...passwordForm.register('newPassword')} error={!!passwordForm.formState.errors.newPassword} helperText={passwordForm.formState.errors.newPassword?.message} fullWidth />
            <TextField label="Confirm new password" type="password" {...passwordForm.register('confirmPassword')} error={!!passwordForm.formState.errors.confirmPassword} helperText={passwordForm.formState.errors.confirmPassword?.message} fullWidth />
            <Button type="submit" variant="contained" disabled={changingPwd}>{changingPwd ? <CircularProgress size={20} color="inherit" /> : 'Change password'}</Button>
            <Typography variant="caption" color="text.secondary">Demo: current password is <strong>password</strong></Typography>
          </Stack>
        </Paper>
      )}

      {tab === 2 && (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, maxWidth: 500 }}>
          <Typography variant="h6" mb={2}>Two-Factor Authentication</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>Add an extra layer of security to your account.</Typography>
          <TwoFASetup />
        </Paper>
      )}

      {tab === 3 && (
        <Paper elevation={2} sx={{ borderRadius: 3, maxWidth: 600 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={600}>Active Sessions</Typography>
            <Button size="small" color="error" onClick={() => confirm({ title: 'Revoke all sessions', message: 'All other devices will be logged out.', severity: 'error', onConfirm: () => revokeAll() })}>Revoke all others</Button>
          </Box>
          <Divider />
          <List disablePadding>
            {sessions?.map((s) => (
              <ListItem key={s.id} divider>
                <ListItemText primary={<>{s.device} {s.current && <Chip label="current" size="small" color="success" sx={{ ml: 1 }} />}</>} secondary={`${s.ip} · Last active ${new Date(s.lastActive).toLocaleString()}`} />
                {!s.current && <ListItemSecondaryAction><IconButton size="small" color="error" onClick={() => revokeSession(s.id)}><DeleteIcon fontSize="small" /></IconButton></ListItemSecondaryAction>}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    <Box sx={{ mt: 4, p: 3, border: '1px solid', borderColor: 'error.main', borderRadius: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} color="error" mb={1}>Danger Zone</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>Permanently delete your account and all associated data. This action cannot be undone (GDPR Art. 17).</Typography>
      <Button color="error" variant="outlined" onClick={() => confirm({ title:'Delete account', message:'All your data will be permanently erased. This cannot be undone.', severity:'error', confirmLabel:'Delete my account', onConfirm: async () => { await apiClient.delete('/profile/account'); logout(); navigate(ROUTES.LOGIN); } })}>Delete my account</Button>
    </Box>
  </Box>
  );
}
