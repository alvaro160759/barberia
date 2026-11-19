import { useRef, useState, useEffect } from 'react';

import { Box, Tab, Card, Tabs, Stack, Avatar, Button, Skeleton, TextField, Typography, Autocomplete } from '@mui/material';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { ItemsTable } from './items-table';

const getPrice = (item) => (typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0);
const getStock = (item) => (typeof item.stock === 'number' ? item.stock : parseInt(item.stock, 10) || 0);

export function ServiceSelectionCard({
  services,
  servicesLoading,
  fetchServices,
  products,
  productsLoading,
  fetchProducts,
  addedItems,
  setAddedItems,
  selectedItem,
  setSelectedItem,
  discountPercent,
  setDiscountPercent,
  discountAmount,
  setDiscountAmount,
  onRegisterService,
  onCancel,
  registering,
}) {
  const [itemTab, setItemTab] = useState('services');
  const isProductTab = itemTab === 'products';

  const catalogOptions = isProductTab ? products : services;
  const catalogLoading = isProductTab ? productsLoading : servicesLoading;
  const catalogFetch = isProductTab ? fetchProducts : fetchServices;

  const hasLoadedRef = useRef(false);
  const wasLoadingRef = useRef(false);

  useEffect(() => {
    if (catalogLoading) {
      wasLoadingRef.current = true;
    } else if (wasLoadingRef.current) {
      hasLoadedRef.current = true;
      wasLoadingRef.current = false;
    }
  }, [catalogLoading]);

  const handleTabChange = (event, newValue) => {
    setItemTab(newValue);
    setSelectedItem(null);
  };

  const handleAddItem = (item) => {
    const itemType = isProductTab ? 'product' : 'service';
    if (addedItems.find((i) => i.id === item.id && i.itemType === itemType)) {
      toast.warning(`Este ${itemType === 'product' ? 'producto' : 'servicio'} ya fue agregado`);
      return;
    }
    if (itemType === 'product' && getStock(item) <= 0) {
      toast.warning('Este producto no tiene stock disponible');
      return;
    }
    setAddedItems([...addedItems, { ...item, itemType, quantity: 1 }]);
    setSelectedItem(null);
  };

  const handleRemoveItem = (item) => {
    setAddedItems(addedItems.filter((i) => !(i.id === item.id && i.itemType === item.itemType)));
  };

  const handleQuantityChange = (item, delta) => {
    const maxQty = item.itemType === 'product' ? getStock(item) : Infinity;
    setAddedItems(
      addedItems.map((i) =>
        i.id === item.id && i.itemType === item.itemType
          ? { ...i, quantity: Math.min(maxQty, Math.max(1, (i.quantity || 1) + delta)) }
          : i
      )
    );
  };

  const subtotal = addedItems.reduce((sum, s) => sum + getPrice(s) * (s.quantity || 1), 0);
  const discountPercentValue = typeof discountPercent === 'number' ? discountPercent : parseFloat(discountPercent) || 0;
  const discountAmountValue = typeof discountAmount === 'number' ? discountAmount : parseFloat(discountAmount) || 0;
  const calculatedDiscount = subtotal * (discountPercentValue / 100);
  const finalDiscount = Math.max(calculatedDiscount, discountAmountValue);
  const total = subtotal - finalDiscount;

  return (
    <>
    <Card sx={{ p: 3, mb: 2, display: 'flex', flexDirection: 'column', minHeight: { xs: 'auto', md: 450 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6">
          Agregar Items
        </Typography>
        <Tabs value={itemTab} onChange={handleTabChange} sx={{ minHeight: 36 }}>
          <Tab value="services" label="Servicios" icon={<Iconify icon="solar:scissors-bold" width={16} />} iconPosition="start" sx={{ minHeight: 36, textTransform: 'none' }} />
          <Tab value="products" label="Productos" icon={<Iconify icon="mingcute:shopping-bag-2-line" width={16} />} iconPosition="start" sx={{ minHeight: 36, textTransform: 'none' }} />
        </Tabs>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Autocomplete
          key={itemTab}
          fullWidth
          options={catalogOptions}
          loading={catalogLoading}
          getOptionLabel={(option) => option.name || ''}
          isOptionEqualToValue={(option, value) => option.id === value?.id && option.itemType === value?.itemType}
          value={selectedItem}
          onChange={(e, value) => {
            if (typeof value === 'string') {
              setSelectedItem(null);
            } else {
              setSelectedItem(value);
            }
          }}
          onInputChange={(e, value) => {
            if (value) {
              catalogFetch({ search: value });
            }
          }}
          renderOption={(props, option) => (
            <Box
              component="li"
              {...props}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Avatar
                variant="rounded"
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  flexShrink: 0,
                }}
              >
                <Iconify icon={isProductTab ? 'mingcute:shopping-bag-2-line' : 'solar:scissors-bold'} width={20} />
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {option.name}
                </Typography>
                {option.description && (
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {option.description}
                  </Typography>
                )}
                {isProductTab && (
                  <Typography variant="caption" color={getStock(option) > 0 ? 'success.main' : 'error.main'} sx={{ display: 'block' }}>
                    Stock: {getStock(option)}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" color="primary" fontWeight={700} sx={{ flexShrink: 0 }}>
                S/ {getPrice(option).toFixed(2)}
              </Typography>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              placeholder={isProductTab ? 'Buscar producto...' : 'Buscar servicio...'}
            />
          )}
        />
        <Button
          variant="contained"
          onClick={() => {
            if (selectedItem) {
              handleAddItem(selectedItem);
            }
          }}
          disabled={!selectedItem}
        >
          Agregar
        </Button>
      </Stack>

      {addedItems && addedItems.length > 0 ? (
        <ItemsTable
          addedItems={addedItems}
          onRemoveItem={handleRemoveItem}
          onQuantityChange={handleQuantityChange}
          subtotal={subtotal}
          discountPercent={discountPercent}
          setDiscountPercent={setDiscountPercent}
          discountAmount={discountAmount}
          setDiscountAmount={setDiscountAmount}
          finalDiscount={finalDiscount}
          total={total}
        />
      ) : catalogLoading && !hasLoadedRef.current ? (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} variant="rounded" height={40} />
          ))}
        </Stack>
      ) : (
        <Box sx={{ p: 4, mb: 2, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Iconify icon="solar:box-minimalistic-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary">
            No hay items agregados
          </Typography>
        </Box>
      )}
    </Card>

    <Stack direction="row" spacing={2} justifyContent="flex-end" >
          <Button 
            variant="outlined" 
            size="small" 
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            size="small" 
            onClick={onRegisterService} 
            disabled={addedItems.length === 0 || registering}
          >
            {registering ? 'Registrando...' : 'Registrar servicio'}
          </Button>
        </Stack>
    </>
  );
}
