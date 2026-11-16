import { Box, Card, Stack, Table, Button, TableRow, TableBody, TableCell, TableHead, TextField, Typography, IconButton, Autocomplete, TableContainer } from '@mui/material';

import { Iconify } from 'src/components/iconify';

export function ServiceSelectionCard({ services, addedServices, setAddedServices, selectedService, setSelectedService, serviceSearch, setServiceSearch, fetchServices }) {
  const handleAddService = (service) => {
    if (!addedServices.find(s => s.id === service.id)) {
      setAddedServices([...addedServices, { ...service, quantity: 1 }]);
    }
  };

  const handleRemoveService = (serviceId) => {
    setAddedServices(addedServices.filter(s => s.id !== serviceId));
  };

  return (
    <Card sx={{ p: 3, mb: 3, minHeight: 232, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Agregar Servicios
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Autocomplete
          fullWidth
          options={services}
          getOptionLabel={(option) => option.name || ''}
          value={selectedService}
          onChange={(e, value) => {
            if (typeof value === 'string') {
              setSelectedService(null);
              setServiceSearch(value);
            } else if (value) {
              setSelectedService(value);
            } else {
              setSelectedService(null);
            }
          }}
          onInputChange={(e, value) => {
            if (value) {
              fetchServices({ search: value });
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              placeholder="Buscar servicio..."
            />
          )}
        />
        <Button
          variant="contained"
          onClick={() => {
            if (selectedService) {
              handleAddService(selectedService);
              setSelectedService(null);
              setServiceSearch('');
            }
          }}
          disabled={!selectedService}
        >
          Agregar
        </Button>
      </Stack>

      {addedServices && addedServices.length > 0 ? (
        <TableContainer component={Box} variant="outlined" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Servicio</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell align="right">Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {addedServices.map((service) => {
                const price = typeof service.price === 'number' ? service.price : parseFloat(service.price) || 0;
                return (
                  <TableRow key={service.id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>S/ {price.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleRemoveService(service.id)} color="error">
                        <Iconify icon="mingcute:delete-2-line" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ p: 4, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No hay servicios agregados
          </Typography>
        </Box>
      )}
    </Card>
  );
}
