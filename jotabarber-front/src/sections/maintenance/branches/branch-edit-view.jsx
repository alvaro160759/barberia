import { useState, useEffect } from 'react';

import { Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useParams , useRouter } from 'src/routes/hooks';

import { useBranches } from 'src/hooks/use-branches';

import { useSettingsContext } from 'src/components/settings';
import { SplashScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { BranchNewEditForm } from './branch-new-edit-form';

export function BranchEditView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const { id } = useParams();
  const { fetchBranch, loading } = useBranches();
  const [currentBranch, setCurrentBranch] = useState(null);

  useEffect(() => {
    const loadBranch = async () => {
      try {
        const branch = await fetchBranch(id);
        setCurrentBranch(branch);
      } catch (error) {
        console.error('Error fetching branch:', error);
      }
    };
    if (id) loadBranch();
  }, [id, fetchBranch]);

  const handleSuccess = () => {
    router.push(paths.dashboard.maintenance.branches.root);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Editar Sede"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Mantenimiento', href: paths.dashboard.maintenance.root },
          { name: 'Sedes', href: paths.dashboard.maintenance.branches.root },
          { name: 'Editar' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      {loading ? <SplashScreen /> : <BranchNewEditForm currentBranch={currentBranch} onSuccess={handleSuccess} />}
    </Container>
  );
}
