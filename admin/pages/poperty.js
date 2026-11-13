import React from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import AdminLayout from '../Layout/AdminLayout';
import AddProperty from '../components/property/viewProperty';
import InHouseLead from '../components/property/inHouseLead';

export default function Poperty() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
    <AdminLayout>
    <Box sx={{ width: '100%' }}>
        <Box
        sx={{
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          bgcolor: '#fff',
          p: 1,
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          textColor="primary"
          TabIndicatorProps={{
            style: {
              height: 4,
              borderRadius: 2,
              backgroundColor: '#FF5722',
            },
          }}
        >
          <Tab
            label="Property"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              color: value === 0 ? '#FF5722' : '#666',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#FF5722',
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
              },
            }}
          />
          <Tab
            label="In House Leads"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              color: value === 1 ? '#FF5722' : '#666',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#FF5722',
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
              },
            }}
          />
        </Tabs>
      </Box>

      <Box sx={{ p: 2 }}>
        {value === 0 && (
          <AddProperty/>
        )}
        {value === 1 && (
          <InHouseLead/>
        )}
      </Box>
    </Box>
    </AdminLayout>
    </>
  );
}

