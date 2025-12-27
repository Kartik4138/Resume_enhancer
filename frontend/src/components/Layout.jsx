import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    return (
        <Box sx={{
            height: 64,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            borderBottom: '1px solid #E2E8F0',
            bgcolor: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 1100
        }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                <Box sx={{ width: 32, height: 32, bgcolor: '#4F46E5', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>A</Typography>
                </Box>
                <Typography variant="h6" fontWeight="800" color="#1E293B">ATS Scorer</Typography>
            </Box>

            {/* Logout */}
            <Button
                onClick={logout}
                startIcon={<LogoutIcon />}
                color="inherit"
                sx={{
                    color: '#64748B',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { color: '#0F172A', bgcolor: 'transparent' }
                }}
            >
                Logout
            </Button>
        </Box>
    );
};

const Layout = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
            <Header />
            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4, display: 'flex', flexDirection: 'column' }}>
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;
