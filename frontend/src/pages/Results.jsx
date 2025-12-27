import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    Paper,
    CircularProgress,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    LinearProgress,
    Card,
    CardContent,
    Button,
    Divider,
    Stack,
    Alert
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Warning as WarningIcon,
    ArrowBack as ArrowBackIcon,
    EmojiEvents as TrophyIcon,
    TipsAndUpdates as TipsIcon,
    Work as WorkIcon,
    Category as CategoryIcon,
    Bolt as BoltIcon
} from '@mui/icons-material';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Navbar from '../components/Navbar';
import ResumeViewer from '../components/ResumeViewer';
import api from '../api/axios';

const Results = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchScore = async () => {
            try {
                const response = await api.post('/ats/score');
                setData(response.data);
            } catch (err) {
                console.error("Scoring failed", err);
                setError("Failed to generate score. Did you upload a resume and job description?");
            } finally {
                setLoading(false);
            }
        };

        fetchScore();
    }, []);

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>Running AI Analysis...</Typography>
                </Box>
            </Box>
        );
    }

    if (error || !data) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
                    <Paper sx={{ p: 4, bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
                        <WarningIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" color="error" gutterBottom>Analysis Failed</Typography>
                        <Typography variant="body1" paragraph>{error || "No data received."}</Typography>
                        <Button variant="outlined" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                    </Paper>
                </Container>
            </Box>
        );
    }

    const { final_ats_score, score_breakdown, skills, experience, sections, suggestions } = data;

    const getScoreColor = (score) => {
        if (score < 40) return '#EF4444'; // Red
        if (score < 70) return '#F59E0B'; // Yellow
        return '#10B981'; // Green
    };

    const scoreColor = getScoreColor(final_ats_score);

    const handleExport = () => {
        window.print();
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
            <Box sx={{ '@media print': { display: 'none' } }}>
                <Navbar />
            </Box>

            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, '@media print': { display: 'none' } }}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Button>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" color="primary" onClick={handleExport}>Export Report</Button>
                        <ResumeViewer />
                    </Box>
                </Box>

                <Grid container spacing={4}>
                    {/* Hero Scoreboard Section */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, borderRadius: 3, position: 'relative', overflow: 'hidden' }} elevation={2}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 6, background: `linear-gradient(90deg, ${getScoreColor(Math.round(final_ats_score))} 0%, ${getScoreColor(Math.round(final_ats_score))} 100%)` }} />
                            <Grid container spacing={6} alignItems="center">
                                {/* Left: Circular Score */}
                                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: { md: '1px solid #E2E8F0' }, py: 2 }}>
                                    <Box sx={{ width: 220, height: 220, mb: 4 }}>
                                        <CircularProgressbar
                                            value={Math.round(final_ats_score)}
                                            text={`${Math.round(final_ats_score)}`}
                                            styles={buildStyles({
                                                pathColor: scoreColor,
                                                textColor: '#0F172A',
                                                trailColor: '#F1F5F9',
                                                textSize: '24px',
                                                pathTransitionDuration: 1.5,
                                                strokeLinecap: 'round'
                                            })}
                                        />
                                    </Box>
                                    <Typography variant="h4" color={scoreColor} fontWeight="800" gutterBottom>
                                        {Math.round(final_ats_score) >= 70 ? 'Excellent' : Math.round(final_ats_score) >= 40 ? 'Good Potential' : 'Needs Work'}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
                                        Optimization Level
                                    </Typography>
                                </Grid>

                                {/* Right: Category Breakdown & Quick Stats */}
                                <Grid item xs={12} md={8}>
                                    <Box sx={{ mb: 5 }}>
                                        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1} sx={{ mb: 3, fontWeight: 'bold' }}>
                                            <CategoryIcon color="primary" /> Performance Breakdown
                                        </Typography>
                                        <Grid container spacing={4}>
                                            {Object.entries(score_breakdown).map(([key, value]) => (
                                                <Grid item xs={12} sm={6} key={key}>
                                                    <Box sx={{ mb: 1 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1 }}>
                                                            <Typography variant="body1" fontWeight="600" sx={{ textTransform: 'capitalize' }}>{key}</Typography>
                                                            <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ bgcolor: '#F1F5F9', px: 1, py: 0.5, borderRadius: 1 }}>
                                                                {typeof value === 'number' ? Math.round(value * 10) / 10 : value}/20
                                                            </Typography>
                                                        </Box>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={(value / 20) * 100}
                                                            sx={{
                                                                height: 10,
                                                                borderRadius: 5,
                                                                bgcolor: '#F1F5F9',
                                                                '& .MuiLinearProgress-bar': {
                                                                    bgcolor: getScoreColor((value / 20) * 100),
                                                                    borderRadius: 5
                                                                }
                                                            }}
                                                        />
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>

                                    <Divider sx={{ mb: 4 }} />

                                    <Box sx={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        <Box>
                                            <Typography variant="h3" fontWeight="bold" color="success.main" sx={{ mb: 0.5 }}>{skills.matched.length}</Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight="500">Skills Matched</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="h3" fontWeight="bold" color={skills.missing.length > 0 ? "error.main" : "text.secondary"} sx={{ mb: 0.5 }}>{skills.missing.length}</Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight="500">Missing Keywords</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="h3" fontWeight="bold" color="secondary.main" sx={{ mb: 0.5 }}>{Object.values(sections).filter(Boolean).length}</Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight="500">Valid Sections</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Detailed Analysis Section */}
                    <Grid item xs={12} md={7}>
                        <Paper sx={{ p: 4, borderRadius: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1} sx={{ mb: 3 }}>
                                <WorkIcon color="secondary" /> Keyword Analysis
                            </Typography>

                            <Stack spacing={4}>
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckCircleIcon fontSize="small" /> Strong Matches
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {skills.matched.length > 0 ? skills.matched.map(skill => (
                                            <Chip key={skill} label={skill} sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 500 }} />
                                        )) : <Typography variant="body2" color="text.secondary">No direct skill matches found.</Typography>}
                                    </Box>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="subtitle2" gutterBottom sx={{ color: 'warning.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <WarningIcon fontSize="small" /> Partial Matches
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {skills.weak.length > 0 ? skills.weak.map(skill => (
                                            <Chip key={skill} label={skill} sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 500 }} />
                                        )) : <Typography variant="body2" color="text.secondary">No partial matches.</Typography>}
                                    </Box>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="subtitle2" gutterBottom sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CancelIcon fontSize="small" /> Missing Keywords
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {skills.missing.length > 0 ? skills.missing.map(skill => (
                                            <Chip key={skill} label={skill} sx={{ bgcolor: '#FEE2E2', color: '#991B1B', fontWeight: 500 }} />
                                        )) : <Typography variant="body2" color="text.secondary">All key skills found!</Typography>}
                                    </Box>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Sidebar: Suggestions & Tips */}
                    <Grid item xs={12} md={5}>
                        <Stack spacing={4}>
                            <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#F8FAFC' }}>
                                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                                    <TipsIcon color="warning" /> Action Plan
                                </Typography>
                                <List disablePadding>
                                    {suggestions.map((suggestion, index) => (
                                        <ListItem key={index} alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                                            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                                                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'warning.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                                    {index + 1}
                                                </Box>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={suggestion}
                                                primaryTypographyProps={{ variant: 'body2', sx: { lineHeight: 1.6 } }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>

                            <Paper sx={{ p: 4, borderRadius: 3 }}>
                                <Typography variant="h6" gutterBottom>Section Check</Typography>
                                <Grid container spacing={2}>
                                    {Object.entries(sections).map(([section, present]) => (
                                        <Grid item xs={6} key={section}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5,
                                                p: 1.5,
                                                borderRadius: 2,
                                                bgcolor: present ? '#F0FDF4' : '#FEF2F2',
                                                border: '1px solid',
                                                borderColor: present ? '#BBF7D0' : '#FECACA',
                                                opacity: present ? 1 : 0.7
                                            }}>
                                                {present ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}
                                                <Typography variant="body2" fontWeight="500" sx={{ textTransform: 'capitalize' }}>{section}</Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Results;
