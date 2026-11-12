import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';

export function BranchTableToolbar({ onRefresh }) {
  const router = useRouter();

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5, pt: 0 }}
    >
      
    </Stack>
  );
}
