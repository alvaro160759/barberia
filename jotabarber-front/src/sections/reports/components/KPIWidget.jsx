import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';

export function KPIWidget({ sx, icon, title, total, color = 'primary', value }) {
  const theme = useTheme();
  return (
    <Card sx={{ py: 3, pl: 3, pr: 2.5, position: 'relative', overflow: 'hidden', ...sx }}>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ typography: 'h3' }}>{value || total}</Box>
        <Typography noWrap variant="subtitle2" component="div" sx={{ color: 'text.secondary' }}>
          {title}
        </Typography>
      </Box>

      <Iconify
        icon={icon}
        sx={{
          top: 24,
          right: 20,
          width: 36,
          height: 36,
          position: 'absolute',
          color: theme.vars.palette[color].main,
        }}
      />

      <Box
        sx={{
          top: -44,
          width: 160,
          zIndex: -1,
          height: 160,
          right: -104,
          opacity: 0.12,
          borderRadius: 3,
          position: 'absolute',
          transform: 'rotate(40deg)',
          background: `linear-gradient(to right, ${theme.vars.palette[color].main} 0%, ${varAlpha(theme.vars.palette[color].mainChannel, 0)} 100%)`,
        }}
      />
    </Card>
  );
}
