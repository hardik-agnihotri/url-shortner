import React, { useState } from 'react';
import axios from 'axios';
import { Link2, BarChart3, Copy, Check, ExternalLink } from 'lucide-react';
import type { URLData, AnalyticsData } from '../types';
import './home.css'; // 👈 Pure CSS import

const API_BASE = 'http://localhost:3000/api/v1';

export default function App() {
  const [inputUrl, setInputUrl] = useState('');
  const [shortenedResult, setShortenedResult] = useState<URLData | null>(null);
  const [copied, setCopied] = useState(false);
  const [shortenerError, setShortenerError] = useState('');

  const [searchCode, setSearchCode] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsError, setAnalyticsError] = useState('');

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setShortenerError('');
    try {
      const response = await axios.post(`${API_BASE}/shorten`, { original_url: inputUrl });
      setShortenedResult(response.data.data);
    } catch (err: any) {
      setShortenerError(err.response?.data?.error || 'Failed to shorten URL');
    }
  };

  const fetchAnalytics = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyticsError('');
    try {
      const response = await axios.get(`${API_BASE}/analytics/${searchCode}`);
      setAnalytics(response.data);
    } catch (err: any) {
      setAnalytics(null);
      setAnalyticsError(err.response?.data?.message || 'No analytics found');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="brand-title">
          <Link2 /> ZipLink Engine
        </h1>
        <p className="brand-subtitle">A high-performance, containerized URL optimization platform.</p>
      </header>

      <main className="dashboard-grid">
        
        {/* SHORTENER PANEL */}
        <section className="panel-card">
          <h2 className="card-title">Optimize URL</h2>
          <form onSubmit={handleShorten} className="form-group">
            <input
              type="text"
              placeholder="Paste your long destination URL here..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="btn btn-blue">
              Generate Short Link
            </button>
          </form>

          {shortenerError && <p className="error-text">{shortenerError}</p>}

          {shortenedResult && (
            <div className="result-box">
              <span className="result-label">Your Link is Ready</span>
              <div className="interactive-output-wrapper">
                <input
                  type="text"
                  readOnly
                  value={`${API_BASE}/${shortenedResult.short_code}`}
                  className="input-field mono"
                  style={{ border: 'none', padding: 0, backgroundColor: 'transparent' }}
                />
                <button 
                  onClick={() => copyToClipboard(`${API_BASE}/${shortenedResult.short_code}`)}
                  className="icon-btn"
                >
                  {copied ? <Check style={{ color: '#4ade80', width: '16px', height: '16px' }} /> : <Copy style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* AUDITING PANEL */}
        <section className="panel-card">
          <h2 className="card-title">
            <BarChart3 style={{ color: '#818cf8' }} /> Live Auditing
          </h2>
          <form onSubmit={fetchAnalytics} className="flex-row-form">
            <input
              type="text"
              placeholder="Enter Short Code (e.g., 1D)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="input-field mono"
            />
            <button type="submit" className="btn btn-indigo btn-append">
              Track
            </button>
          </form>

          {analyticsError && <p className="error-text">{analyticsError}</p>}

          {analytics && (
            <div style={{ marginTop: '1.5rem' }}>
              <div className="metrics-grid">
                <div className="metric-block">
                  <span className="metric-label">Total Redirections</span>
                  <span className="metric-value">{analytics.Data.clicks}</span>
                </div>
                <div className="metric-block">
                  <span className="metric-label">Status</span>
                  <div className="status-indicator">
                    <span className="pulse-dot"></span> Active
                  </div>
                </div>
              </div>

              <div className="metric-block" style={{ marginTop: '1rem' }}>
                <span className="metric-label">Destination URL</span>
                <a 
                  href={analytics.Data.original_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="destination-link"
                >
                  {analytics.Data.original_url} <ExternalLink style={{ width: '12px', height: '12px' }} />
                </a>
              </div>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}