
import React, { useState, useCallback } from 'react';
import { getVenueRecommendations, getRecentEventNews } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { DefaultEventCategories, SparklesIcon } from '../constants';
import { GroundingChunkWeb } from '../types';

interface Recommendation {
  name: string;
  type: 'venue' | 'vendor';
  description: string;
  pros?: string[];
  cons?: string[];
}

const AiRecommender: React.FC = () => {
  const [eventType, setEventType] = useState(DefaultEventCategories[0]);
  const [location, setLocation] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newsTopic, setNewsTopic] = useState('latest event technology');
  const [eventNews, setEventNews] = useState<string | null>(null);
  const [newsSources, setNewsSources] = useState<GroundingChunkWeb[] | null>(null);
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  const handleFetchRecommendations = useCallback(async () => {
    if (!eventType || !location) {
      setError('Please provide both event type and location.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecommendations(null);
    setSummary(null);

    const result = await getVenueRecommendations(eventType, location);
    if ('error' in result) {
      setError(result.error);
    } else {
      setRecommendations(result.recommendations);
      setSummary(result.summary || null);
    }
    setIsLoading(false);
  }, [eventType, location]);

  const handleFetchNews = useCallback(async () => {
    if (!newsTopic) {
      setNewsError('Please provide a topic for news.');
      return;
    }
    setIsNewsLoading(true);
    setNewsError(null);
    setEventNews(null);
    setNewsSources(null);

    const result = await getRecentEventNews(newsTopic);
    if (result.error) {
      setNewsError(result.error);
    } else {
      setEventNews(result.text);
      setNewsSources(result.sources?.map(s => s.web).filter(Boolean) as GroundingChunkWeb[] || null);
    }
    setIsNewsLoading(false);
  }, [newsTopic]);


  return (
    <div className="space-y-12">
      {/* Venue/Vendor Recommender */}
      <div className="p-6 md:p-8 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold text-sky-700 mb-6 flex items-center">
          {SparklesIcon} AI Event Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
            <select 
              id="eventType" 
              value={eventType} 
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 bg-white"
            >
              {DefaultEventCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              <option value="Other">Other (Specify below)</option>
            </select>
            {eventType === 'Other' && (
                 <input 
                    type="text" 
                    placeholder="Specify event type" 
                    onChange={(e) => setEventType(e.target.value)} 
                    className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                />
            )}
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Location (City, State/Country)</label>
            <input 
              type="text" 
              id="location" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              placeholder="e.g., San Francisco, CA"
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>
        <button
          onClick={handleFetchRecommendations}
          disabled={isLoading}
          className="w-full md:w-auto px-6 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Getting Suggestions...' : 'Get AI Suggestions'}
        </button>

        {isLoading && <LoadingSpinner message="Thinking of great ideas for you..." />}
        {error && <p className="mt-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        
        {summary && <p className="mt-6 text-slate-700 italic bg-sky-50 p-4 rounded-md">{summary}</p>}

        {recommendations && recommendations.length > 0 && (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-semibold text-slate-800">Recommendations:</h3>
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-slate-50 p-4 rounded-lg shadow">
                <h4 className="text-lg font-semibold text-sky-700 capitalize">{rec.name} <span className="text-xs bg-sky-200 text-sky-800 px-2 py-0.5 rounded-full ml-2">{rec.type}</span></h4>
                <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                {rec.pros && rec.pros.length > 0 && (
                  <div className="mt-2">
                    <strong className="text-sm text-green-600">Pros:</strong>
                    <ul className="list-disc list-inside ml-4 text-sm text-slate-500">
                      {rec.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                    </ul>
                  </div>
                )}
                {rec.cons && rec.cons.length > 0 && (
                  <div className="mt-2">
                    <strong className="text-sm text-amber-600">Cons/Considerations:</strong>
                    <ul className="list-disc list-inside ml-4 text-sm text-slate-500">
                      {rec.cons.map((con, i) => <li key={i}>{con}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Event News */}
      <div className="p-6 md:p-8 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold text-sky-700 mb-6 flex items-center">
          <i className="fas fa-newspaper mr-2"></i> AI-Powered Event News
        </h2>
        <div className="mb-6">
          <label htmlFor="newsTopic" className="block text-sm font-medium text-slate-700 mb-1">News Topic</label>
          <input 
            type="text" 
            id="newsTopic" 
            value={newsTopic} 
            onChange={(e) => setNewsTopic(e.target.value)} 
            placeholder="e.g., sustainable event practices"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <button
          onClick={handleFetchNews}
          disabled={isNewsLoading}
          className="w-full md:w-auto px-6 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50"
        >
          {isNewsLoading ? 'Fetching News...' : 'Get Latest News'}
        </button>

        {isNewsLoading && <LoadingSpinner message="Searching for the latest updates..." />}
        {newsError && <p className="mt-4 text-red-600 bg-red-100 p-3 rounded-md">{newsError}</p>}
        
        {eventNews && (
          <div className="mt-6 prose prose-sm max-w-none bg-slate-50 p-4 rounded-md">
            <h3 className="text-xl font-semibold text-slate-800">Latest on "{newsTopic}":</h3>
            <p className="text-slate-700 whitespace-pre-wrap">{eventNews}</p>
            {newsSources && newsSources.length > 0 && (
              <div className="mt-4">
                <strong className="text-xs text-slate-500">Sources:</strong>
                <ul className="list-disc list-inside ml-4 text-xs">
                  {newsSources.map((source, index) => (
                    <li key={index}>
                      <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-800 hover:underline">
                        {source.title || source.uri}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiRecommender;
