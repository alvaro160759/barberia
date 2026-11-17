import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export function SelectableCard({ selected = false, disabled = false, onClick, children, contentSx }) {
  return (
    <Card
      onClick={disabled ? undefined : onClick}
      sx={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        height: 1,
        opacity: disabled ? 0.45 : 1,
        border: (theme) => `1px solid ${selected ? theme.vars.palette.primary.main : theme.vars.palette.divider}`,
        borderWidth: selected ? 2 : 1,
        bgcolor: selected ? 'primary.lighter' : disabled ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s',
        '&:hover': disabled ? {} : { borderColor: 'primary.main' },
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          py: 1.5,
          '&:last-child': { pb: 1.5 },
          ...contentSx,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
}
