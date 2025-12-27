import React, { useState } from 'react';
import { Button, Box, CircularProgress, Alert } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import api from '../api/axios';

const ResumeViewer = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleViewResume = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/resumes/latest-analyzed-file', {
                responseType: 'blob'
            });

            // Create a blob URL
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Open in new tab
            window.open(url, '_blank');

            // Cleanup strictly speaking should be done, but for a new tab open it's often handled by browser or GC eventually
            // window.URL.revokeObjectURL(url); 
        } catch (err) {
            console.error("Failed to fetch resume", err);
            setError("Could not load the resume file.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Button
                variant="outlined"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleViewResume}
                disabled={loading}
            >
                {loading ? 'Opening...' : 'View Analyzed Resume'}
            </Button>
            {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        </Box>
    );
};

export default ResumeViewer;
