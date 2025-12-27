import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../api/axios';

const ResumeUpload = ({ onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // API: POST /resumes/upload
            // The backend now returns a FileResponse (blob) on success
            const response = await api.post('/resumes/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                responseType: 'blob' // Expecting binary file
            });

            // Even though we get a blob, it counts as success
            // We might not get the JSON ID, but that's okay for the Dashboard flow
            if (onUploadSuccess) {
                // Pass the blob for preview
                onUploadSuccess({ success: true, file: response.data });
            }
        } catch (err) {
            console.error('Upload failed', err);
            setError('Failed to upload resume. Please try again.');
        } finally {
            setUploading(false);
        }
    }, [onUploadSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles: 1
    });

    return (
        <Paper
            {...getRootProps()}
            sx={{
                p: 4,
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'border .24s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                flexGrow: 1
            }}
            elevation={0}
        >
            <input {...getInputProps()} />

            {uploading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="body1">Uploading and parsing...</Typography>
                </Box>
            ) : (
                <>
                    <CloudUploadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    {isDragActive ? (
                        <Typography variant="h6" color="primary">Drop the resume here...</Typography>
                    ) : (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Drag & drop your resume here
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                or click to select file (PDF, DOCX)
                            </Typography>
                        </Box>
                    )}
                </>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}
        </Paper>
    );
};

export default ResumeUpload;
