import React, { useState } from 'react';
import { Box, TextField, Button, Alert, Typography, Paper } from '@mui/material';
import api from '../api/axios';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAnalysis } from '../context/AnalysisContext.jsx';

const JobDescriptionInput = ({ onAnalyzeSuccess }) => {
    const { jobDescription, setJobDescription } = useAnalysis();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Sync local input with global context
    const handleChange = (e) => {
        setJobDescription(e.target.value);
    };

    const handleAnalyze = async () => {
        if (!jobDescription.trim()) return;

        setLoading(true);
        setMessage(null);

        try {
            await api.post('/jobs/analyze', { content: jobDescription });
            setMessage({ type: 'success', text: 'Job Description saved & ready!' });
            if (onAnalyzeSuccess) onAnalyzeSuccess();
        } catch (error) {
            console.error('JD Analysis failed', error);
            setMessage({ type: 'error', text: 'Failed to process Job Description.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <AutoAwesomeIcon color="primary" /> Job Description
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Paste the job description here.
            </Typography>
            <TextField
                fullWidth
                multiline
                minRows={15} // Large default height to match Resume Card
                variant="outlined"
                placeholder="Paste Job Description here..."
                value={jobDescription}
                onChange={handleChange}
                sx={{
                    mb: 0,
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    '& .MuiInputBase-root': {
                        alignItems: 'flex-start',
                        height: '100%',
                        borderRadius: 3
                    },
                    '& .MuiInputBase-input': {
                        height: '100% !important',
                        overflow: 'auto !important'
                    }
                }}
            />

            {message && (
                <Alert severity={message.type} sx={{ mb: 2 }}>
                    {message.text}
                </Alert>
            )}

            {/* Optional internal button, but Input is now live-synced */}
            <Button
                variant="contained"
                onClick={handleAnalyze}
                disabled={!jobDescription.trim() || loading}
                sx={{ mt: 2 }}
            >
                {loading ? 'Saving...' : 'Save Context'}
            </Button>
        </Paper>
    );
};

export default JobDescriptionInput;
