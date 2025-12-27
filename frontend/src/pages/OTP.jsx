import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Container,
    Alert
} from '@mui/material';
import { motion } from 'framer-motion';

const OTP = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { verifyOtp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const { success, message } = await verifyOtp(email, otp);

        if (success) {
            navigate('/dashboard');
        } else {
            setError(message);
        }
        setIsLoading(false);
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default', alignItems: 'center', justifyContent: 'center' }}>
            <Container component="main" maxWidth="xs">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                    <Paper elevation={0} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 4, border: '1px solid #E2E8F0' }}>
                        <Typography variant="h1" sx={{ fontSize: '3rem', mb: 2 }}>✉️</Typography>
                        <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                            Verify your email
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                            We've sent a 6-digit code to <br /><strong>{email}</strong>
                        </Typography>

                        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="otp"
                                placeholder="000000"
                                name="otp"
                                autoFocus
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                inputProps={{
                                    maxLength: 6,
                                    style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem', fontWeight: 'bold' }
                                }}
                                sx={{ mb: 3 }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{ mb: 2, height: 50, fontSize: '1rem' }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Verifying...' : 'Verify Code'}
                            </Button>
                            <Button
                                fullWidth
                                variant="text"
                                size="small"
                                onClick={() => navigate('/login')}
                                sx={{ color: 'text.secondary' }}
                            >
                                Use a different email
                            </Button>
                        </Box>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default OTP;
