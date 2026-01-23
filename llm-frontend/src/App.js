import React, { useState } from 'react';
import { Wand2, Workflow, Loader2, Copy, Check, AlertCircle } from 'lucide-react';

const LLMFrontend = () => {
  const [activeTab, setActiveTab] = useState('simplify');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Simplify Text State
  const [simplifyInput, setSimplifyInput] = useState('');
  const [targetAudience, setTargetAudience] = useState('general audience');
  const [simplifiedResult, setSimplifiedResult] = useState(null);
  
  // Workflow State
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowFormat, setWorkflowFormat] = useState('steps');
  const [workflowResult, setWorkflowResult] = useState(null);

  const API_BASE_URL = 'http://localhost:8000'; // Update with your Django backend URL

  const handleSimplify = async () => {
    if (!simplifyInput.trim()) {
      setError('Please enter some text to simplify');
      return;
    }

    setLoading(true);
    setError('');
    setSimplifiedResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/simplify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: simplifyInput,
          target_audience: targetAudience,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSimplifiedResult(data);
      } else {
        setError(data.error || 'Failed to simplify text');
      }
    } catch (err) {
      setError('Network error. Make sure your Django backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWorkflow = async () => {
    if (!workflowDescription.trim()) {
      setError('Please enter a project description');
      return;
    }

    setLoading(true);
    setError('');
    setWorkflowResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-workflow/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: workflowDescription,
          format: workflowFormat,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setWorkflowResult(data);
      } else {
        setError(data.error || 'Failed to generate workflow');
      }
    } catch (err) {
      setError('Network error. Make sure your Django backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const audiences = [
    'general audience',
    'junior developer',
    'senior developer',
    'non-technical person',
    'student',
    'executive'
  ];

  const formats = [
    { value: 'steps', label: 'Numbered Steps' },
    { value: 'checklist', label: 'Checklist' },
    { value: 'detailed', label: 'Detailed with Estimates' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI Text Processor
          </h1>
          <p className="text-gray-600">
            Simplify complex text or generate structured workflows using AI
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="flex border-b">
            <button
              onClick={() => {
                setActiveTab('simplify');
                setError('');
                setSimplifiedResult(null);
              }}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'simplify'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Wand2 size={20} />
                <span>Simplify Text</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('workflow');
                setError('');
                setWorkflowResult(null);
              }}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'workflow'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Workflow size={20} />
                <span>Generate Workflow</span>
              </div>
            </button>
          </div>

          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Simplify Text Tab */}
            {activeTab === 'simplify' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {audiences.map((audience) => (
                      <option key={audience} value={audience}>
                        {audience.charAt(0).toUpperCase() + audience.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complex Text
                  </label>
                  <textarea
                    value={simplifyInput}
                    onChange={(e) => setSimplifyInput(e.target.value)}
                    placeholder="Enter complex text to simplify..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  onClick={handleSimplify}
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={20} />
                      <span>Simplify Text</span>
                    </>
                  )}
                </button>

                {/* Simplified Result */}
                {simplifiedResult && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-green-800">Simplified Version</h3>
                        <button
                          onClick={() => copyToClipboard(simplifiedResult.simplified)}
                          className="text-green-600 hover:text-green-700 flex items-center gap-1"
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                          <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{simplifiedResult.simplified}</p>
                      <p className="text-xs text-gray-500 mt-3">
                        Model: {simplifiedResult.model_used}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Generate Workflow Tab */}
            {activeTab === 'workflow' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Format
                  </label>
                  <select
                    value={workflowFormat}
                    onChange={(e) => setWorkflowFormat(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {formats.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description
                  </label>
                  <textarea
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    placeholder="Describe your project or task..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  onClick={handleGenerateWorkflow}
                  disabled={loading}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Workflow size={20} />
                      <span>Generate Workflow</span>
                    </>
                  )}
                </button>

                {/* Workflow Result */}
                {workflowResult && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-purple-800">Generated Workflow</h3>
                        <button
                          onClick={() => copyToClipboard(workflowResult.workflow)}
                          className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                          <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{workflowResult.workflow}</p>
                      <p className="text-xs text-gray-500 mt-3">
                        Model: {workflowResult.model_used}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Powered by AI • Make sure your Django backend is running on {API_BASE_URL}</p>
        </div>
      </div>
    </div>
  );
};

export default LLMFrontend;