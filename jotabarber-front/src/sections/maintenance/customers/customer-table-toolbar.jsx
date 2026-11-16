import Stack from '@mui/material/Stack';

import { useRouter } from 'src/routes/hooks';


export function CustomerTableToolbar({ onRefresh }) {
  const router = useRouter();

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5, pt: 2 }}
     />
  );
}
