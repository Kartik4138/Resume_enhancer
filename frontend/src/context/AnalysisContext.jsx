import React, { createContext, useContext, useState } from 'react';

const AnalysisContext = createContext();

export const useAnalysis = () => useContext(AnalysisContext);

export const AnalysisProvider = ({ children }) => {
    const [resumeData, setResumeData] = useState({
        uploaded: false,
        file: null,
        previewUrl: null,
        fileName: '',
        uploadTime: null
    });

    const [jobDescription, setJobDescription] = useState('');
    const [analysisResults, setAnalysisResults] = useState(null);

    return (
        <AnalysisContext.Provider value={{
            resumeData,
            setResumeData,
            jobDescription,
            setJobDescription,
            analysisResults,
            setAnalysisResults
        }}>
            {children}
        </AnalysisContext.Provider>
    );
};
