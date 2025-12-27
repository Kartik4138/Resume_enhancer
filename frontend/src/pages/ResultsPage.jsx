import React, { useEffect, useState } from 'react';
import {
    Box, Grid, Typography, Paper, CircularProgress,
    LinearProgress, Chip, List, ListItem, ListItemIcon,
    ListItemText, Button, Divider, Dialog, IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAnalysis } from '../context/AnalysisContext.jsx';
import api from '../api/axios';

const ScoreGauge = ({ score }) => (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress variant="determinate" value={score} size={120} thickness={4} sx={{ color: score > 70 ? '#10B981' : score > 40 ? '#F59E0B' : '#EF4444' }} />
        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h4" fontWeight="800" color="text.primary">{Math.round(score)}%</Typography>
        </Box>
    </Box>
);

const SectionCheck = ({ label, passed }) => (
    <ListItem disablePadding sx={{ mb: 1 }}>
        <ListItemIcon sx={{ minWidth: 32 }}>
            {passed ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}
        </ListItemIcon>
        <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 500 }} />
    </ListItem>
);

const SuggestionCard = ({ text }) => (
    <Paper elevation={0} sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 2, height: '100%', bgcolor: '#F8FAFC' }}>
        <Typography variant="body2" fontWeight="500" color="#334155">{text}</Typography>
    </Paper>
);

const ResultsPage = () => {
    const { analysisResults, setAnalysisResults } = useAnalysis();
    const [loading, setLoading] = useState(true);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        // Try to recover from context OR session storage
        let dataToUse = analysisResults;

        if (!dataToUse) {
            const stored = sessionStorage.getItem('latestAnalysisResults');
            if (stored) {
                try {
                    dataToUse = JSON.parse(stored);
                    setAnalysisResults(dataToUse); // Restore to context
                } catch (e) {
                    console.error("Failed to parse stored results", e);
                }
            }
        }

        // If we have results (from context or storage), load preview
        if (dataToUse) {
            const fetchPreview = async () => {
                try {
                    const resumeRes = await api.get('/resumes/latest/verify', { responseType: 'blob' });
                    setPreviewUrl(URL.createObjectURL(resumeRes.data));
                } catch (e) {
                    console.error("Preview load failed", e);
                } finally {
                    setLoading(false);
                }
            };
            fetchPreview();
        } else {
            setLoading(false);
        }
    }, [analysisResults, setAnalysisResults]);

    const handleDownload = () => {
        alert("Downloading PDF Report...");
    };

    if (loading) return (
        <Box sx={{ p: 10, textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading Results...</Typography>
        </Box>
    );

    if (!analysisResults) return (
        <Box sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
                No analysis results found.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Please go back to the dashboard and upload a resume/JD to analyze.
            </Typography>
            <Button variant="contained" onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
            </Button>
        </Box>
    );

    // Recursive helper to find the object containing 'ATS_Score' or 'ats_score'
    const findAnalysisData = (obj) => {
        if (!obj || typeof obj !== 'object') return null;

        // Check if this object has the target keys
        if ('ATS_Score' in obj || 'ats_score' in obj || 'ATS_score' in obj || 'final_ats_score' in obj) {
            return obj;
        }

        // Try parsing only if it looks like a JSON string
        if (typeof obj === 'string') {
            try {
                const clean = obj.replace(/```json/g, '').replace(/```/g, '');
                const parsed = JSON.parse(clean);
                return findAnalysisData(parsed);
            } catch (e) { return null; }
        }

        // Search deeper
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const found = findAnalysisData(obj[key]);
                if (found) return found;
            }
        }
        return null;
    };

    // 1. Try to find the valid data object anywhere in the response
    let finalData = findAnalysisData(analysisResults);

    // 2. If recursively found, use it. If not, fallback to root
    const activeData = finalData || {};

    // --- PRECISE MAPPING BASED ON PROVIDED JSON ---
    const ATS_Score = activeData.final_ats_score || 0;

    // Breakdown
    const breakdown = activeData.score_breakdown || {};
    const skillsBreakdown = breakdown.skills || 0;
    const expBreakdown = breakdown.experience || 0;
    const formatBreakdown = breakdown.formatting || 0;
    const keywordBreakdown = breakdown.keywords || 0;
    const sectionsBreakdown = breakdown.sections || 0;

    // Skills & Keywords (Robust Merge)
    const skillsData = activeData.skills || {};
    const keywordsData = activeData.keywords || {};

    // Helper to merge and dedupe arrays
    const mergeUnique = (arr1, arr2) => [...new Set([...(arr1 || []), ...(arr2 || [])])];

    const matchedSkills = mergeUnique(skillsData.matched, keywordsData.matched);
    const weakSkills = mergeUnique(skillsData.weak, keywordsData.weak);
    const missingKeywords = mergeUnique(skillsData.missing, keywordsData.missing);

    // Sections (Check if robust map exists)
    const sections = activeData.sections || {};
    const hasSectionsData = Object.keys(sections).length > 0;

    // Experience Checks
    const experienceData = activeData.experience || {};
    const experienceFeedback = experienceData.feedback || experienceData.suggestions || experienceData.experience_suggestion || [];

    // Formatting Checks
    const formatting = activeData.formatting || {};
    const formattingFeedback = formatting.feedback || [];

    // Suggestions
    const suggestions = activeData.suggestions || [];


    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" color="#1E293B">ATS Analysis Report</Typography>
                    <Typography variant="body1" color="text.secondary">Detailed breakdown of your compatibility.</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<VisibilityIcon />} onClick={() => setPreviewOpen(true)}>View Resume</Button>
                    <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownload} sx={{ bgcolor: '#4F46E5' }}>Download Report</Button>
                </Box>
            </Box>

            <Grid container spacing={4}>
                {/* SECTION 1 & 2: GAUGE + BREAKDOWN */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 4, border: '1px solid #E2E8F0', borderRadius: 3, textAlign: 'center', height: '100%' }}>
                        <Typography variant="subtitle2" textTransform="uppercase" fontWeight="bold" color="text.secondary" sx={{ mb: 3 }}>Overall Match</Typography>
                        <ScoreGauge score={ATS_Score} />
                        <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>{ATS_Score >= 80 ? 'Excellent' : ATS_Score >= 60 ? 'Good' : 'Needs Work'}</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ p: 4, border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Score Breakdown</Typography>

                        {/* Mapped Breakdown */}
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            {[
                                { label: 'Skills', value: skillsBreakdown, color: '#4F46E5' },
                                { label: 'Experience', value: expBreakdown, color: '#10B981' },
                                { label: 'Keywords', value: keywordBreakdown, color: '#F59E0B' },
                                { label: 'Sections', value: sectionsBreakdown, color: '#8B5CF6' },
                                { label: 'Formatting', value: formatBreakdown, color: '#64748B' }
                            ].map((item, index) => (
                                <Box key={item.label} sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    py: 1.5,
                                    borderBottom: index !== 4 ? '1px dashed #E2E8F0' : 'none'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: item.color }} />
                                        <Typography variant="body2" fontWeight="500" color="text.secondary">{item.label}</Typography>
                                    </Box>
                                    <Typography variant="body1" fontWeight="700" color="text.primary">{item.value}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* SECTION 3: SKILLS (3 Columns) */}
                <Grid item xs={12}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Skills Analysis</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderTop: '4px solid #10B981', borderRadius: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>MATCHED</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {matchedSkills.slice(0, 10).map(s => (
                                        <Chip key={s} label={s} color="success" size="small" variant="outlined" />
                                    ))}
                                    {matchedSkills.length > 10 && <Chip label={`+${matchedSkills.length - 10} more`} size="small" />}
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderTop: '4px solid #F59E0B', borderRadius: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>WEAK MATCH</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {weakSkills.map(s => (
                                        <Chip key={s} label={s} sx={{ borderColor: '#F59E0B', color: '#B45309' }} size="small" variant="outlined" />
                                    ))}
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderTop: '4px solid #EF4444', borderRadius: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>MISSING</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {missingKeywords.map(k => (
                                        <Chip key={k} label={k} color="error" size="small" variant="outlined" />
                                    ))}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>

                {/* SECTION 5: SECTION DETECTION */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Section Detection</Typography>
                        <List>
                            <SectionCheck label="Contact Information" passed={true} />
                            <SectionCheck label="Education" passed={sections.education ?? true} />
                            <SectionCheck label="Experience" passed={sections.experience ?? true} />
                            <SectionCheck label="Skills" passed={sections.skills ?? true} />
                            <SectionCheck label="Projects" passed={sections.projects ?? true} />
                            <SectionCheck label="Certifications" passed={sections.certifications ?? true} />
                        </List>
                    </Paper>
                </Grid>

                {/* SECTION 6: EXPERIENCE ANALYSIS (NEW) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Experience Insights</Typography>
                        {experienceFeedback.length > 0 ? (
                            <List>
                                {experienceFeedback.map((text, i) => (
                                    <ListItem key={i} disablePadding sx={{ mb: 1, alignItems: 'flex-start' }}>
                                        <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                                            <AutoAwesomeIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={text}
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', fontWeight: 500 }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No experience feedback available.</Typography>
                        )}
                    </Paper>
                </Grid>

                {/* SECTION 7: FORMATTING ANALYSIS */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Formatting & Style</Typography>
                        {formattingFeedback.length > 0 ? (
                            <List>
                                {formattingFeedback.map((text, i) => (
                                    <ListItem key={i} disablePadding sx={{ mb: 1, alignItems: 'flex-start' }}>
                                        <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                                            <CheckCircleIcon sx={{ color: '#64748B', fontSize: 20 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={text}
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', fontWeight: 500 }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No formatting feedback available.</Typography>
                        )}
                    </Paper>
                </Grid>

                {/* SECTION 8: SUGGESTIONS */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Critical Suggestions</Typography>
                        <Grid container spacing={2}>
                            {suggestions.map((s, i) => (
                                <Grid item xs={12} key={i}><SuggestionCard text={s} /></Grid>
                            ))}
                            {suggestions.length === 0 && <Grid item xs={12}><Typography variant="body2" color="text.secondary">No suggestions provided.</Typography></Grid>}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* PREVIEW MODAL */}
            <Dialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4, height: '85vh' } }}
            >
                <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
                    <Typography variant="h6" fontWeight="bold">Scored Resume Reference</Typography>
                    <IconButton onClick={() => setPreviewOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Box sx={{ flexGrow: 1, bgcolor: '#525659', overflow: 'hidden' }}>
                    {previewUrl && <iframe src={previewUrl} width="100%" height="100%" style={{ border: 'none' }} title="Scored Resume" />}
                </Box>
            </Dialog>
        </Box>
    );
};

export default ResultsPage;
