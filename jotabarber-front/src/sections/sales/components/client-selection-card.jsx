import { Box, Card, Stack, Button, TextField, Typography, IconButton } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

export function ClientSelectionCard({ selectedClient, setSelectedClient, clientSearch, setClientSearch }) {
  const router = useRouter();

  return (
    <Card sx={{ p: 3, mb: 3, minHeight: 232, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Seleccionar Cliente
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nombre, teléfono o DNI..."
          value={clientSearch}
          onChange={(e) => setClientSearch(e.target.value)}
        />
        <Button
          variant="contained"
          size="small"
          startIcon={<Iconify icon="solar:add-circle-bold" />}
          onClick={() => router.push(paths.dashboard.maintenance.customers.new)}
          sx={{ minWidth: 140 }}
        >
          Nuevo Cliente
        </Button>
      </Stack>

      {selectedClient ? (
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1">
              {typeof selectedClient.first_name === 'string' ? selectedClient.first_name : ''} {typeof selectedClient.last_name === 'string' ? selectedClient.last_name : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {typeof selectedClient.phone === 'string' ? selectedClient.phone : ''} • {typeof selectedClient.email === 'string' ? selectedClient.email : ''}
            </Typography>
          </Box>
          <IconButton onClick={() => setSelectedClient(null)}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Selecciona un cliente o crea uno nuevo
          </Typography>
        </Box>
      )}
    </Card>
  );
}
