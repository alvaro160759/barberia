import { useCallback, useState } from 'react';

import { toast } from 'src/components/snackbar';
import { useCustomers } from 'src/hooks/use-customers';

export const emptyClientForm = {
  document_type: 'DNI',
  document_number: '',
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
};

export function useNewClientForm({ onSuccess } = {}) {
  const { createCustomer } = useCustomers();
  const [form, setForm] = useState(emptyClientForm);
  const [saving, setSaving] = useState(false);

  const resetForm = useCallback((initialDocumentNumber = '') => {
    setForm({ ...emptyClientForm, document_number: initialDocumentNumber });
  }, []);

  const saveClient = useCallback(async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast.warning('Ingresa nombres y apellidos del cliente');
      return null;
    }
    setSaving(true);
    try {
      const payload = {
        document_type: form.document_type,
        document_number: form.document_number || null,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone || null,
        email: form.email || null,
      };
      const response = await createCustomer(payload);
      const created = response?.data?.data || response?.data || response;
      const client = created?.id ? created : { ...payload };
      onSuccess?.(client);
      return client;
    } catch (err) {
      return null;
    } finally {
      setSaving(false);
    }
  }, [form, createCustomer, onSuccess]);

  return { form, setForm, saving, resetForm, saveClient };
}
