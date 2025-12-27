import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Container,
    Alert,
    InputAdornment
} from '@mui/material';
import { Email as EmailIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { requestOtp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!email) {
            setError('Email is required');
            setIsLoading(false);
            return;
        }

        const { success, message } = await requestOtp(email);

        if (success) {
            navigate('/otp', { state: { email } });
        } else {
            setError(message);
        }
        setIsLoading(false);
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
            {/* Left Side - Brand/Visuals (Could be an image or gradient) */}
            <Box sx={{
                flex: 1,
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                p: 8,
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                color: 'white'
            }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <Typography variant="h2" fontWeight="bold" gutterBottom>
                        Resume Intelligence
                    </Typography>
                    <Typography variant="h5" sx={{ opacity: 0.8, mb: 4, maxWidth: 450 }}>
                        Optimize your resume for any job description with our AI-powered ATS scorer.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                            <Typography variant="h4" fontWeight="bold">95%</Typography>
                            <Typography variant="body2">Parsability</Typography>
                        </Box>
                        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                            <Typography variant="h4" fontWeight="bold">2x</Typography>
                            <Typography variant="body2">Interview Chances</Typography>
                        </Box>
                    </Box>
                </motion.div>
            </Box>

            {/* Right Side - Form */}
            <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                    <Paper elevation={0} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: 4 }}>
                        <Box sx={{ width: 48, height: 48, bgcolor: 'primary.main', borderRadius: 2, mb: 3 }} />
                        <Typography component="h1" variant="h5" fontWeight="bold" gutterBottom>
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            Enter your email to sign in or create an account
                        </Typography>

                        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 2 }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                endIcon={!isLoading && <ArrowForwardIcon />}
                                sx={{ mt: 2, mb: 2, height: 50, fontSize: '1rem' }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending Code...' : 'Continue'}
                            </Button>
                        </Box>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default Login;
