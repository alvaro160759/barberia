import { useEffect, useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { useCustomers } from 'src/hooks/use-customers';
import { catalogApi } from 'src/actions/catalog';
import { toast } from 'src/components/snackbar';

import { _documentTypes } from 'src/_mock/_typeDocuments';

const initialFormData = {
  first_name: '',
  last_name: '',
  full_name: '',
  phone: '',
  email: '',
  document_type: '',
  document_number: '',
  birth_date: '',
  notes: '',
  active: true,
};

export function CustomerNewEditForm({ currentCustomer, onSuccess }) {
  const { createCustomer, updateCustomer, loading } = useCustomers();

  const [formData, setFormData] = useState(initialFormData);
  const [dniLoading, setDniLoading] = useState(false);

  useEffect(() => {
    if (currentCustomer) {
      const fullName = [currentCustomer.first_name, currentCustomer.last_name]
        .filter(Boolean)
        .join(' ');
      setFormData({
        first_name: currentCustomer.first_name || '',
        last_name: currentCustomer.last_name || '',
        full_name: fullName,
        phone: currentCustomer.phone || '',
        email: currentCustomer.email || '',
        document_type: currentCustomer.document_type || '',
        document_number: currentCustomer.document_number || '',
        birth_date: currentCustomer.birth_date || '',
        notes: currentCustomer.notes || '',
        active: currentCustomer.active ?? true,
      });
    }
  }, [currentCustomer]);

  const lookupDni = async (dni) => {
    if (dni.length !== 8 || formData.document_type !== 'DNI') return;
    setDniLoading(true);
    try {
      const response = await catalogApi.getDni(dni);
      const data = response.data?.data || response.data;
      if (data?.full_name) {
        const nameParts = data.full_name.trim().split(/\s+/);
        const firstName = data.first_name || nameParts[0] || '';
        const lastName = data.last_name || nameParts.slice(1).join(' ') || '';
        setFormData((prev) => ({
          ...prev,
          document_number: dni,
          first_name: firstName,
          last_name: lastName,
          full_name: data.full_name,
        }));
      }
    } catch (err) {
      const message = err?.message || 'No se encontró información para ese DNI.';
      toast.error(message);
    } finally {
      setDniLoading(false);
    }
  };

  const handleDocumentNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
    setFormData({ ...formData, document_number: value });

    if (value.length === 8) {
      lookupDni(value);
    }
  };

  const handleDocumentNumberKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      lookupDni(formData.document_number);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let { first_name, last_name, full_name } = formData;

    if (!first_name && full_name) {
      const parts = full_name.trim().split(/\s+/);
      first_name = parts[0] || '';
      last_name = parts.slice(1).join(' ') || '';
    }

    const payload = {
      ...formData,
      first_name,
      last_name,
    };
    delete payload.full_name;

    try {
      if (currentCustomer) {
        await updateCustomer(currentCustomer.id, payload);
      } else {
        await createCustomer(payload);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card sx={{ p: 3 }}>
        <Grid container spacing={2}>

          <Grid xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Tipo de documento</InputLabel>
              <Select
                value={formData.document_type}
                label="Tipo de documento"
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
              >
                {_documentTypes.map((type) => (
                  <MenuItem key={type.id} value={type.name}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              name="document_number"
              label="Número de documento"
              value={formData.document_number}
              onChange={handleDocumentNumberChange}
              onKeyDown={handleDocumentNumberKeyDown}
              inputProps={{ maxLength: 8 }}
              InputProps={{
                endAdornment: dniLoading ? <CircularProgress size={20} /> : null,
              }}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              name="full_name"
              label="Nombre"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </Grid>

          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              name="phone"
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              name="birth_date"
              label="Fecha de nacimiento"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            />
          </Grid>
          <Grid xs={12}>
            <TextField
              fullWidth
              name="notes"
              label="Notas"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Grid>
          <Grid xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
              }
              label="Activo"
            />
          </Grid>
          <Grid xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button type="button" variant="outlined" onClick={onSuccess} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={loading || dniLoading}>
                {loading ? 'Guardando...' : currentCustomer ? 'Actualizar' : 'Crear'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </form>
  );
}
