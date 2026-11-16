import Stack from '@mui/material/Stack';

export function EmployeeTableToolbar() {
  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5, pt: 0 }}
     />
  );
}
