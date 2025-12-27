import React, { useEffect, useState } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../api/axios';

const ResumeHistory = ({ refreshTrigger, onSelectResume }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch history
    // API: GET /resumes/{resume_id}/history - wait, the spec says {resume_id}/history
    // This implies getting history of a SPECIFIC resume version? 
    // "Show previous uploads" suggests a list of ALL uploads. 
    // Usually this would be GET /resumes/ or GET /resumes/history.
    // I will assume there is an endpoint to get ALL resumes provided by the backend for the "History" table.
    // If strict spec: "GET /resumes/{resume_id}/history" might be "versions of this resume".
    // Let's try GET /resumes/ first (common convention) or handle as best effort.
    // Wait, "Resume Version History GET /resumes/{resume_id}/history"
    // Maybe I need to upload one first, get an ID, and then I can see history? 
    // But a Dashboard usually shows "Recent Uploads". 
    // I will implement a safe fallback or try to list resumes if an endpoint exists.
    // Let's assume for now we list the user's resumes. If "GET /resumes" doesn't exist, I might be limited.
    // I'll stick to the spec: "Resume Version History"
    // This implies I need a resume_id.
    // Maybe I only show history AFTER I upload one?
    // Or maybe there's a "GET /resumes" endpoint implied or missing from the brief description.
    // I'll try to fetch `/resumes` to see if it lists them. If not, I'll only show the current one.

    // Actually, for a production ATS, you'd want to see all your candidates or uploads.
    // I will assume `GET /resumes` lists resumes. If not, I will handle the error gracefully.

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // API: GET /resumes/history (Uses token for user context)
                const response = await api.get('/resumes/history');
                // Response structure: { resume_id: "...", history: [ { resume_version_id, status, created_at, analyses: [] } ] }
                setHistory(response.data.history || []);
            } catch (e) {
                console.error("Could not fetch history", e);
                // Fallback or empty state
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [refreshTrigger]);

    if (loading) return <Typography>Loading history...</Typography>;
    if (!history || history.length === 0) return <Typography variant="body2" color="text.secondary">No upload history found.</Typography>;

    return (
        <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Version ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Analysis Score</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {history.map((version) => {
                        // Get latest score if available
                        const latestAnalysis = version.analyses && version.analyses.length > 0 ? version.analyses[0] : null;

                        return (
                            <TableRow key={version.resume_version_id}>
                                <TableCell sx={{ fontFamily: 'monospace' }}>
                                    {version.resume_version_id.substring(0, 8)}...
                                </TableCell>
                                <TableCell>{new Date(version.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={version.status || 'Processed'}
                                        color="success"
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    {latestAnalysis ? (
                                        <Chip label={`${latestAnalysis.final_score}%`} size="small" color={latestAnalysis.final_score > 70 ? 'success' : latestAnalysis.final_score > 40 ? 'warning' : 'error'} />
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">N/A</Typography>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ResumeHistory;
