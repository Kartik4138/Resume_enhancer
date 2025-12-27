import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Typography,
    Button,
    Paper,
    Dialog,
    IconButton,
    Divider,
    Stack
} from '@mui/material';
import ResumeUpload from '../components/ResumeUpload';
import JobDescriptionInput from '../components/JobDescriptionInput';
import ResumeHistory from '../components/ResumeHistory';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import { useAnalysis } from '../context/AnalysisContext.jsx';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const navigate = useNavigate();
    const { resumeData, setResumeData, jobDescription, setJobDescription, setAnalysisResults } = useAnalysis();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [isReplacing, setIsReplacing] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    // Sync with backend on mount
    const fetchLatestResumeVerify = async () => {
        try {
            const response = await api.get('/resumes/latest/verify', { responseType: 'blob' });
            if (response.data.size > 0) {
                const url = URL.createObjectURL(response.data);
                setResumeData({
                    uploaded: true,
                    previewUrl: url,
                    fileName: 'Current_Resume.pdf',
                    uploadTime: new Date().toLocaleString()
                });
            }
        } catch (e) {
            console.log("No resume found.");
        }
    };

    useEffect(() => {
        if (!resumeData.uploaded) {
            fetchLatestResumeVerify();
        }
    }, []);

    const handleResumeSuccess = () => {
        fetchLatestResumeVerify();
        setIsReplacing(false);
    };

    const handleScoreTrigger = async () => {
        if (!resumeData.uploaded || !jobDescription) return;
        setAnalyzing(true);
        try {
            const response = await api.post('/ats/score', {
                job_description: jobDescription
            });

            console.log("Analysis API Response:", response);

            // SAVE RESULT TO CONTEXT & STORAGE
            if (response.data) {
                // Backup for refresh/navigation safety
                sessionStorage.setItem('latestAnalysisResults', JSON.stringify(response.data));

                setAnalysisResults(response.data);
                navigate('/results');
            }
        } catch (error) {
            console.error("Analysis trigger failed", error);
        } finally {
            setAnalyzing(false);
        }
    };

    // Shared Styles
    const cardStyle = {
        p: 4,
        borderRadius: 6,
        border: '1px solid #F1F5F9',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
        height: '620px', // Fixed height for perfect symmetry
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white'
    };

    const sectionHeaderStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3
    };

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: 2 }}>
            {/* Loading Overlay */}
            <Dialog
                open={analyzing}
                PaperProps={{
                    style: { backgroundColor: 'transparent', boxShadow: 'none', overflow: 'hidden' }
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                        <AutoAwesomeIcon sx={{ fontSize: 80, color: '#4F46E5' }} />
                    </motion.div>
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 2, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                        AI is matching your profiles...
                    </Typography>
                </Box>
            </Dialog>

            {/* Page Header */}
            <Box sx={{ mb: 8, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1.5 }}>
                    <AutoFixHighIcon sx={{ fontSize: 48, color: '#4F46E5' }} />
                    <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: '-0.04em', color: '#0F172A' }}>
                        Resume Enhancer
                    </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, opacity: 0.8 }}>
                    Ready to optimize your resume for your next big role?
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* LEFT Section: Resume */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={cardStyle}>
                        <Box sx={sectionHeaderStyle}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#EFF6FF', color: '#3B82F6', display: 'flex' }}>
                                    <DescriptionIcon />
                                </Box>
                                <Typography variant="h6" fontWeight="800">1. Upload Resume</Typography>
                            </Stack>
                            {resumeData.uploaded && !isReplacing && (
                                <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => setIsReplacing(true)}
                                    sx={{ textTransform: 'none', fontWeight: 600 }}
                                >
                                    Change File
                                </Button>
                            )}
                        </Box>

                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            {(!resumeData.uploaded || isReplacing) ? (
                                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <ResumeUpload onUploadSuccess={handleResumeSuccess} />
                                    {isReplacing && (
                                        <Button
                                            onClick={() => setIsReplacing(false)}
                                            fullWidth
                                            sx={{ mt: 2, color: 'text.secondary' }}
                                        >
                                            Keep Current Resume
                                        </Button>
                                    )}
                                </Box>
                            ) : (
                                <Box sx={{
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px dashed #E2E8F0',
                                    borderRadius: 4,
                                    bgcolor: '#F8FAFC',
                                    p: 3
                                }}>
                                    <PictureAsPdfIcon sx={{ fontSize: 100, color: '#EF4444', mb: 2 }} />
                                    <Typography variant="h6" fontWeight="800" sx={{ mb: 0.5 }}>
                                        {resumeData.fileName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                        Successfully parsed and ready
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        disableElevation
                                        onClick={() => setPreviewOpen(true)}
                                        startIcon={<VisibilityIcon />}
                                        sx={{
                                            borderRadius: 3,
                                            px: 4,
                                            bgcolor: 'white',
                                            color: '#0F172A',
                                            border: '1px solid #E2E8F0',
                                            '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' }
                                        }}
                                    >
                                        Preview Document
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* RIGHT Section: Job Description */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={cardStyle}>
                        <Box sx={sectionHeaderStyle}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#F0FDF4', color: '#16A34A', display: 'flex' }}>
                                    <AutoAwesomeIcon />
                                </Box>
                                <Typography variant="h6" fontWeight="800">2. Job Description</Typography>
                            </Stack>
                        </Box>

                        <Box sx={{ flexGrow: 1 }}>
                            <JobDescriptionInput onAnalyzeSuccess={() => { }} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* ACTION FOOTER */}
            <Box sx={{ mt: 8, pb: 4, textAlign: 'center' }}>
                <AnimatePresence>
                    {!jobDescription && resumeData.uploaded && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 600 }}>
                                ⚠️ Please paste a job description to proceed with the match analysis.
                            </Typography>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        variant="contained"
                        size="large"
                        disabled={!resumeData.uploaded || !jobDescription || analyzing}
                        onClick={handleScoreTrigger}
                        sx={{
                            px: 10, py: 2.5, borderRadius: 4,
                            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                            color: 'white', fontSize: '1.2rem', fontWeight: '800', textTransform: 'none',
                            boxShadow: '0px 10px 30px rgba(79, 70, 229, 0.3)',
                            '&:hover': { background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)' },
                            '&.Mui-disabled': { background: '#F1F5F9', color: '#94A3B8' }
                        }}
                    >
                        {analyzing ? 'Processing...' : 'Analyze Match Score'}
                    </Button>
                </motion.div>
            </Box>

            <Divider sx={{ my: 6, borderColor: '#F1F5F9' }} />

            {/* HISTORY SECTION */}
            <Box sx={{ mb: 10 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
                    <HistoryIcon sx={{ color: '#64748B', fontSize: 28 }} />
                    <Typography variant="h5" fontWeight="800" color="#1E293B">Recent Activity</Typography>
                </Stack>
                <ResumeHistory refreshTrigger={resumeData.uploaded} />
            </Box>

            {/* PREVIEW MODAL */}
            <Dialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 5, height: '90vh', overflow: 'hidden' } }}
            >
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'white' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <PictureAsPdfIcon sx={{ color: '#EF4444' }} />
                        <Typography fontWeight="800" variant="subtitle1">{resumeData.fileName}</Typography>
                    </Stack>
                    <IconButton onClick={() => setPreviewOpen(false)} sx={{ bgcolor: '#F8FAFC' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
                <Box sx={{ flexGrow: 1, bgcolor: '#F1F5F9', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                    {resumeData.previewUrl && (
                        <iframe
                            src={`${resumeData.previewUrl}#toolbar=0`}
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                            title="Resume Preview"
                        />
                    )}
                </Box>
            </Dialog>
        </Box>
    );
};

export default Dashboard;