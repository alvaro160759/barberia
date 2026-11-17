import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

export function StepLayout({ title, loading = false, empty = false, emptyMessage, children }) {
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
        {title}
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress />
        </Box>
      ) : empty ? (
        <Typography variant="body2" color="error">
          {emptyMessage}
        </Typography>
      ) : (
        children
      )}
    </Box>
  );
}
