import { useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { ClientFormFields } from './client-form-fields';
import { useNewClientForm } from '../hooks/use-new-client-form';

export function NewClientDialog({ open, onClose, initialDocumentNumber = '', onSuccess }) {
  const { form, setForm, saving, resetForm, saveClient } = useNewClientForm({ onSuccess });

  useEffect(() => {
    if (open) {
      resetForm(initialDocumentNumber);
    }
  }, [open, initialDocumentNumber, resetForm]);

  const handleSave = async () => {
    const client = await saveClient();
    if (client) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Registrar nuevo cliente</DialogTitle>
      <DialogContent>
        <ClientFormFields form={form} onChange={setForm} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cliente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
