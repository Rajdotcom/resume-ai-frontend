import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, XCircle, AlertCircle, Briefcase } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a resume file first.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription || "Looking for a software engineer.");

    try {
      // Send the file to our Node.js backend
      const response = await axios.post('http://localhost:5000/api/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data.analysis);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 font-sans text-slate-800">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-2 flex justify-center items-center gap-3">
          <Briefcase size={36} />
          AI Resume Screener
        </h1>
        <p className="text-slate-500">Upload a resume and instantly see how it matches your job posting.</p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Input Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h2 className="text-xl font-bold mb-4">1. Upload Candidate Data</h2>
          
          <form onSubmit={handleAnalyze} className="space-y-6">
            {/* Job Description Box */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">Job Description</label>
              <textarea 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                rows="5"
                placeholder="Paste the job requirements here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              ></textarea>
            </div>

            {/* File Upload Box */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
              <input 
                type="file" 
                id="resumeUpload" 
                className="hidden" 
                accept=".pdf,.docx" 
                onChange={handleFileChange} 
              />
              <label htmlFor="resumeUpload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud size={48} className="text-blue-500 mb-3" />
                <span className="font-semibold text-slate-700">
                  {file ? file.name : "Click to upload Resume (PDF/DOCX)"}
                </span>
                <span className="text-sm text-slate-400 mt-1">Max file size: 5MB</span>
              </label>
            </div>

            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
            >
              {loading ? "Analyzing Profile with AI..." : "Analyze Candidate"}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: AI Results Dashboard */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
          <h2 className="text-xl font-bold mb-4">2. AI Screening Analysis</h2>
          
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 mt-20">
              <CheckCircle size={64} className="mb-4 opacity-20" />
              <p>Upload a profile to generate insights.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-blue-500 mt-20 animate-pulse">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-semibold">Reading resume & consulting Gemini...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-fade-in">
              {/* Match Score */}
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-700">Overall Match Score</span>
                <span className={`text-2xl font-black ${result.matchPercentage > 70 ? 'text-green-500' : result.matchPercentage > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {result.matchPercentage}%
                </span>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</h3>
                <p className="text-slate-700 leading-relaxed">{result.summary}</p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="font-bold text-green-700 mb-2 flex items-center gap-2"><CheckCircle size={18}/> Strengths</h3>
                  <ul className="text-sm text-green-800 space-y-1 list-disc pl-4">
                    {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2"><XCircle size={18}/> Weaknesses</h3>
                  <ul className="text-sm text-red-800 space-y-1 list-disc pl-4">
                    {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>

              {/* Missing Skills */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AlertCircle size={16}/> Missing Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hiring Recommendation */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <span className="font-bold text-slate-700 mr-3">Recommendation:</span>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                  result.hiringRecommendation.includes('Strong') ? 'bg-green-500 text-white' : 
                  result.hiringRecommendation.includes('No') ? 'bg-red-500 text-white' : 'bg-yellow-400 text-slate-900'
                }`}>
                  {result.hiringRecommendation}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;