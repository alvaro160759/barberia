import { z as zod } from 'zod';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { MenuItem } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import axios, { endpoints } from 'src/utils/axios';
import { publicBookingApi } from 'src/api/public-booking';

import { Iconify } from 'src/components/iconify';
import { AnimateAvatar } from 'src/components/animate';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';
import { setSession } from 'src/auth/context/jwt/utils';

import Logo from '../../../../public/logo/logo-jota.png';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Usuario es obligatorio' }),
  sucursal: zod
    .string()
    .min(1, { message: 'Sucursal es obligatorio' }),
  password: zod
    .string()
    .min(1, { message: 'Contraseña es obligatorio' })
    .min(6, { message: 'Contraseña no tiene 6 caracteres' }),
});

// ----------------------------------------------------------------------

export function CenteredSignInView() {
  const password = useBoolean();
  const router = useRouter();
  const { checkUserSession } = useAuthContext();
  const [errorMsg, setErrorMsg] = useState('');
  const [branches, setBranches] = useState([]);

  const defaultValues = { email: '', sucursal: '', password: '' };

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const response = await publicBookingApi.getBranches();
        const list = response.data || [];
        setBranches(list);
        if (list.length > 0) {
          setValue('sucursal', String(list[0].id));
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    loadBranches();
  }, [setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      const response = await axios.post(endpoints.auth.login, {
        username: data.email,
        password: data.password,
        branch_id: data.sucursal,
      });

      // Guardar el token usando setSession y redirigir al dashboard
      await setSession(response.data.data.token);

      // Actualizar el contexto de autenticación
      await checkUserSession?.();

      router.push(paths.dashboard.root);
      
    } catch (error) {
      console.error('LOGIN ERROR', error);
      // Aquí puedes mostrar el error al usuario
      setErrorMsg(error?.message || 'Error al iniciar sesión');
    }
  });

  const renderLogo = <AnimateAvatar sx={{ mb: 3, mx: 'auto' }} width={120} slotProps={{ avatar: { src: Logo } }} />;

  const renderHead = (
    <Stack alignItems="center" spacing={1} sx={{ mb: 5 }}>
      <Typography variant="h3" color='inherit'>Inicio de sesión</Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={1.5}>

      <Field.Select
        name="sucursal"
        label="Sucursal"
        fullWidth
        textAlign="center"
        size=""
        InputLabelProps={{ shrink: true }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="solar:shop-bold" />
            </InputAdornment>
          ),
        }}
      >
        {branches.map((branch) => (
          <MenuItem key={branch.id} value={String(branch.id)}>
            {branch.name}
          </MenuItem>
        ))}
      </Field.Select>


      

      <Field.Text
        name="email"
        label="Usuario"
        textAlign="center"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="solar:user-bold" />
            </InputAdornment>
          ),
        }}
      />

      <Field.Text
        name="password"
        label="Contraseña"
        type={password.value ? 'text' : 'password'}
        textAlign="center"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="solar:lock-keyhole-bold" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Iniciando sesion..."
        startIcon={<Iconify icon="solar:login-bold" />}
      >
        Ingresar
      </LoadingButton>
    </Stack>
  );


  return (
    <>
      {renderLogo}

      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>

    </>
  );
}
