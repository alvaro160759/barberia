import { useState } from 'react';

import { Box, Card, Chip, Stack, Avatar, TextField, Typography, IconButton, CircularProgress } from '@mui/material';

import { useCustomers } from 'src/hooks/use-customers';

import { catalogApi } from 'src/actions/catalog';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { NewClientDialog } from './new-client-dialog';

export function ClientSelectionCard({ selectedClient, setSelectedClient, clientSearch, setClientSearch }) {
  const { customers } = useCustomers();
  const [dniLoading, setDniLoading] = useState(false);
  const [openClientModal, setOpenClientModal] = useState(false);

  const handleSearchDni = async () => {
    const dni = clientSearch.replace(/\D/g, '');
    if (dni.length !== 8) {
      toast.warning('Ingresa un DNI de 8 dígitos');
      return;
    }
    setDniLoading(true);
    try {
      const response = await catalogApi.getDni(dni);
      const data = response.data?.data || response.data;
      if (!data?.full_name) {
        toast.error('No se encontró información para ese DNI');
        return;
      }
      const existing = customers.find((c) => c.document_number === dni);
      if (existing) {
        setSelectedClient(existing);
      } else {
        setSelectedClient({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          full_name: data.full_name,
          document_type: 'DNI',
          document_number: dni,
        });
      }
      setClientSearch('');
    } catch (err) {
      toast.error(err?.message || 'No se pudo consultar el DNI');
    } finally {
      setDniLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchDni();
    }
  };

  const handleClientCreated = (client) => {
    setSelectedClient(client);
    setClientSearch('');
  };

  return (
    <Card sx={{ p: 2, minHeight: { xs: 'auto', md: 190 }, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        Seleccionar Cliente
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Ingresa el DNI de 8 dígitos y presiona Enter o el ícono de búsqueda"
          value={clientSearch}
          onChange={(e) => setClientSearch(e.target.value.replace(/\D/g, '').slice(0, 8))}
          onKeyDown={handleKeyDown}
          inputProps={{ maxLength: 8 }}
          InputProps={{
            endAdornment: dniLoading ? (
              <CircularProgress size={20} />
            ) : (
              <IconButton onClick={handleSearchDni} edge="end">
                <Iconify icon="mingcute:search-line" />
              </IconButton>
            ),
          }}
        />
        <IconButton
          color="primary"
          onClick={() => setOpenClientModal(true)}
          sx={{ border: '1px dashed', borderColor: 'primary.light', borderRadius: 1, flexShrink: 0 }}
          title="Registrar nuevo cliente"
        >
          <Iconify icon="mingcute:user-add-line" />
        </IconButton>
      </Stack>

      {selectedClient ? (
        <Box
          sx={{
            p: 1.5,
            flexGrow: 1,
            bgcolor: 'primary.lighter',
            border: '1px solid',
            borderColor: 'primary.light',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            {(typeof selectedClient.first_name === 'string' ? selectedClient.first_name.charAt(0) : '') +
              (typeof selectedClient.last_name === 'string' ? selectedClient.last_name.charAt(0) : '')}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body1" fontWeight={600} noWrap>
              {typeof selectedClient.first_name === 'string' ? selectedClient.first_name : ''} {typeof selectedClient.last_name === 'string' ? selectedClient.last_name : ''}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }} flexWrap="wrap" useFlexGap>
              {typeof selectedClient.document_number === 'string' && selectedClient.document_number && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`DNI: ${selectedClient.document_number}`}
                  sx={{ height: 20, fontSize: 10 }}
                />
              )}
              {typeof selectedClient.phone === 'string' && selectedClient.phone && (
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<Iconify icon="solar:phone-bold" width={12} />}
                  label={selectedClient.phone}
                  sx={{ height: 20, fontSize: 10 }}
                />
              )}
              {typeof selectedClient.email === 'string' && selectedClient.email && (
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<Iconify icon="solar:letter-bold" width={12} />}
                  label={selectedClient.email}
                  sx={{ height: 20, fontSize: 10, maxWidth: 180 }}
                />
              )}
            </Stack>
          </Box>
          <IconButton
            onClick={() => setSelectedClient(null)}
            size="small"
            sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
          >
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>
      ) : (
        <Box
          sx={{
            px: 2,
            bgcolor: 'grey.50',
            border: '1px dashed',
            borderColor: 'grey.300',
            borderRadius: 2,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.lighter',
              color: 'primary.main',
            }}
          >
            <Iconify icon="solar:user-id-bold" width={20} />
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            Sin cliente seleccionado
          </Typography>
        </Box>
      )}

      <NewClientDialog
        open={openClientModal}
        onClose={() => setOpenClientModal(false)}
        initialDocumentNumber={clientSearch.replace(/\D/g, '')}
        onSuccess={handleClientCreated}
      />
    </Card>
  );
}
