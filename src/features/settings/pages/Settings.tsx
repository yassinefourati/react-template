import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Box, Typography, Stack, MenuItem, Select, FormControl, InputLabel, FormHelperText, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { settingsSchema, type SettingsFormData } from '../schemas/settingsSchema';
import { useAppStore } from '@/shared/stores/useAppStore';
import { useUIStore } from '@/shared/stores/useUIStore';
export default function Settings() {
  const { t, i18n } = useTranslation(); const { notify } = useAppStore(); const { setLanguage } = useUIStore();
  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting } } = useForm<SettingsFormData>({ resolver: zodResolver(settingsSchema), defaultValues: { name: 'Admin', email: 'admin@demo.com', language: 'en' } });
  const onSubmit = async (data: SettingsFormData) => { await new Promise((r) => setTimeout(r, 400)); setLanguage(data.language); i18n.changeLanguage(data.language); notify(t('settings.saved'), 'success'); };
  return (
    <Box><Typography variant="h4" fontWeight={700} mb={3}>{t('settings.general')}</Typography>
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 480 }}>
      <Stack spacing={2.5}>
        <TextField label={t('settings.name')} fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
        <TextField label={t('auth.email')} fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
        <FormControl fullWidth error={!!errors.language}>
          <InputLabel>Language</InputLabel>
          <Select label="Language" defaultValue="en" {...register('language')}>
            <MenuItem value="en">English</MenuItem><MenuItem value="fr">Français</MenuItem>
          </Select>
          <FormHelperText>{errors.language?.message}</FormHelperText>
        </FormControl>
        <Button type="submit" variant="contained" disabled={!isDirty || isSubmitting} startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}>{t('settings.save')}</Button>
      </Stack>
    </Box></Box>
  );
}
