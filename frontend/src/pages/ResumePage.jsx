import React, { useEffect } from 'react';
import { Box, Grid, Typography, Paper, Button, Chip } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ResumeUpload from '../components/ResumeUpload';
import { useAnalysis } from '../context/AnalysisContext.jsx';
import api from '../api/axios';

const ResumePage = () => {
    const { resumeData, setResumeData } = useAnalysis();

    const fetchLatestResume = async () => {
        try {
            const response = await api.get('/resumes/latest/verify', { responseType: 'blob' });
            if (response.data.size > 0) {
                const url = URL.createObjectURL(response.data);
                setResumeData({
                    uploaded: true,
                    previewUrl: url,
                    fileName: 'Current_Resume.pdf', // Backend doesn't always send filename in generic blob, defaulting
                    uploadTime: new Date().toLocaleString()
                });
            }
        } catch (e) {
            console.log("No resume found");
        }
    };

    useEffect(() => {
        if (!resumeData.uploaded) {
            fetchLatestResume();
        }
    }, []);

    const handleUploadSuccess = () => fetchLatestResume();

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="800" color="#1E293B">Resume</Typography>
                <Typography variant="body1" color="text.secondary">Manage your source document for analysis.</Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Left Column: 40% */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={0} sx={{ p: 4, border: '1px solid #E2E8F0', borderRadius: 3, bgcolor: 'white' }}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" fontWeight="bold">Upload Resume</Typography>
                        </Box>

                        <ResumeUpload onUploadSuccess={handleUploadSuccess} />

                        {resumeData.uploaded && (
                            <Box sx={{ mt: 4, p: 3, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <UploadFileIcon color="primary" />
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">{resumeData.fileName}</Typography>
                                        <Typography variant="caption" color="text.secondary">{resumeData.uploadTime || 'Just now'}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip icon={<CheckCircleIcon />} label="Parsed Successfully" color="success" size="small" variant="outlined" />
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Right Column: 60% Preview */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={0} sx={{ height: '75vh', border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden', bgcolor: '#525659' }}>
                        {resumeData.previewUrl ? (
                            <iframe
                                src={resumeData.previewUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 'none' }}
                                title="Resume Preview"
                            />
                        ) : (
                            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1' }}>
                                <Typography>No Resume Selected</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ResumePage;
