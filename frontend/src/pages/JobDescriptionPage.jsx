import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import JobDescriptionInput from '../components/JobDescriptionInput';
import { useAnalysis } from '../context/AnalysisContext.jsx';

const JobDescriptionPage = () => {
    const { setJobDescription } = useAnalysis();

    // We can hook into the success here if we modify the component,
    // but for now, we'll let the component handle the API call
    // and just present it cleanly.

    const handleSuccess = (data) => {
        // Ideally we store the JD text or ID in context here
        // console.log("JD Analyzed", data);
    };

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="800" color="#1E293B">Job Description</Typography>
                <Typography variant="body1" color="text.secondary">Paste the JD to check your resume against valid criteria.</Typography>
            </Box>

            <Paper elevation={0} sx={{ p: 4, border: '1px solid #E2E8F0', borderRadius: 3, bgcolor: 'white' }}>
                <JobDescriptionInput onAnalyzeSuccess={handleSuccess} />
            </Paper>
        </Box>
    );
};

export default JobDescriptionPage;
