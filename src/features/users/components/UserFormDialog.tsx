import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { userSchema, type UserFormData } from '../schemas/userSchema';
import { useCreateUser, useUpdateUser } from '../hooks/useUsers';
import { sanitizeObject } from '@/shared/lib/sanitize';
import LoadingButton from '@/shared/components/LoadingButton';
import type { User } from '../api/usersApi';

interface Props { open: boolean; onClose: () => void; editUser?: User | null; }

export default function UserFormDialog({ open, onClose, editUser }: Props) {
  const isEdit = Boolean(editUser);
  const { mutateAsync: create, isPending: creating } = useCreateUser();
  const { mutateAsync: update, isPending: updating } = useUpdateUser();
  const isPending = creating || updating;

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', role: 'viewer' },
  });

  useEffect(() => {
    if (editUser) {
      reset({ name: editUser.name, email: editUser.email, role: editUser.role.toLowerCase() as UserFormData['role'] });
    } else {
      reset({ name: '', email: '', role: 'viewer' });
    }
  }, [editUser, reset]);

  const onSubmit = async (data: UserFormData) => {
    const clean = sanitizeObject(data);        // ← sanitize before sending
    if (isEdit && editUser) {
      await update({ id: editUser.id, body: clean });
    } else {
      await create(clean);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          <TextField label="Email" fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
          <TextField label="Role" select fullWidth defaultValue="viewer" {...register('role')} error={!!errors.role} helperText={errors.role?.message}>
            {['admin','editor','viewer'].map((r) => (
              <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>Cancel</Button>
        <LoadingButton variant="contained" onClick={handleSubmit(onSubmit)}
          loading={isPending} disabled={isEdit && !isDirty}>
          {isEdit ? 'Save' : 'Create'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
