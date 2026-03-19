import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

interface FieldRowProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

export const FieldRow: React.FC<FieldRowProps> = ({ label, value, mono }) => {
  return (
    <Box sx={{ display: 'flex', py: 0.75, alignItems: 'baseline', gap: 1 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 140, flexShrink: 0, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        component="div"
        sx={mono ? { fontFamily: 'monospace', fontSize: '0.8rem' } : undefined}
      >
        {value || (
          <Box component="span" sx={{ color: 'text.disabled' }}>
            —
          </Box>
        )}
      </Typography>
    </Box>
  );
};
