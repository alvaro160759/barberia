import { MenuItem, Stack, TextField } from '@mui/material';

import { _documentTypes } from 'src/_mock/_typeDocuments';

export function ClientFormFields({ form, onChange }) {
  const setField = (field) => (e) => onChange({ ...form, [field]: e.target.value });

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <TextField
        select
        fullWidth
        size="small"
        label="Tipo de documento"
        value={form.document_type}
        onChange={setField('document_type')}
      >
        {_documentTypes.map((type) => (
          <MenuItem key={type.id} value={type.name}>
            {type.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        size="small"
        label="Número de documento"
        value={form.document_number}
        onChange={(e) => onChange({ ...form, document_number: e.target.value.replace(/\D/g, '').slice(0, 12) })}
        inputProps={{ maxLength: 8 }}
      />
      <Stack direction="row" spacing={1.5}>
        <TextField
          fullWidth
          size="small"
          label="Nombres"
          value={form.first_name}
          onChange={setField('first_name')}
        />
        <TextField
          fullWidth
          size="small"
          label="Apellidos"
          value={form.last_name}
          onChange={setField('last_name')}
        />
      </Stack>
      <TextField
        fullWidth
        size="small"
        label="Teléfono (opcional)"
        value={form.phone}
        onChange={setField('phone')}
      />
      <TextField
        fullWidth
        size="small"
        label="Email (opcional)"
        value={form.email}
        onChange={setField('email')}
      />
    </Stack>
  );
}
