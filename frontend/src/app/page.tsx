'use client';

import { useState } from 'react';
import axios from 'axios';
import { Send, Loader2, Sparkles } from 'lucide-react';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState(150);
  const [story, setStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const sampleTopics = [
    'A magical forest',
    'Space exploration',
    'Time traveler',
    'Underwater city',
    'Robot companion',
    'Lost treasure'
  ];

  const generateStory = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic for your story');
      return;
    }

    if (length < 10 || length > 2000) {
      setError('Story length must be between 10 and 2000 words');
      return;
    }

    setIsLoading(true);
    setError('');
    setStory('');
    
    try {
      const response = await axios.post('http://localhost:3001/api/generate-story', {
        topic: topic.trim(),
        length: length
      }, {
        timeout: 45000 // 45 second timeout for longer stories
      });
      
      setStory(response.data.story);
    } catch (err: any) {
      console.error('Error:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Try a shorter story or check your connection.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to generate story. Please ensure the backend is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleTopic = (sampleTopic: string) => {
    setTopic(sampleTopic);
    setError('');
  };

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 0 && value <= 2000) {
      setLength(value);
      setError('');
    }
  };

  const estimatedTime = Math.max(1, Math.round(length / 200));

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-gray-800" />
            <h1 className="text-4xl font-light text-gray-900">
              Story Generator
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            AI-powered storytelling
          </p>
        </div>

        {/* Input Form */}
        <div className="space-y-8">
          {/* Topic Input */}
          <div className="space-y-3">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
              What's your story about?
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your story topic..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
              disabled={isLoading}
              maxLength={100}
            />
            
            {/* Sample Topics */}
            <div className="flex flex-wrap gap-2 mt-3">
              {sampleTopics.map((sampleTopic, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleTopic(sampleTopic)}
                  disabled={isLoading}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
                >
                  {sampleTopic}
                </button>
              ))}
            </div>
          </div>

          {/* Length Input */}
          <div className="space-y-3">
            <label htmlFor="length" className="block text-sm font-medium text-gray-700">
              Story length (10-2000 words)
            </label>
            <div className="relative">
              <input
                id="length"
                type="number"
                min="10"
                max="2000"
                value={length}
                onChange={handleLengthChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-gray-900"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="text-xs text-gray-400">
                  ≈ {estimatedTime} min read
                </span>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateStory}
            disabled={isLoading || !topic.trim() || length < 10 || length > 2000}
            className="w-full bg-gray-900 text-white py-4 px-6 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-200 font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating your story...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Generate Story
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Story Display */}
        {story && (
          <div className="mt-12 space-y-6">
            <div className="border-t border-gray-100 pt-8">
              <h2 className="text-2xl font-light text-gray-900 mb-6">
                Your Story
              </h2>
              <div className="prose prose-gray max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                  {story}
                </div>
              </div>
            </div>
            
            <div className="text-center pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Generated by Gemini 2.5 Flash • {story.split(' ').length} words
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}