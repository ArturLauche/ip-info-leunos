'use client';

import { useState } from 'react';

interface CdnResult {
  url: string;
  cdn?: string;
  isUsingCdn: boolean;
  details?: {
    serverHeader?: string;
    xCdnHeader?: string;
    viaHeader?: string;
    cacheControl?: string;
    age?: string;
  };
}

export default function CdnCheckerPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<CdnResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const detectCdn = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Ensure URL has protocol
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      
      // Fetch headers from the URL
      const response = await fetch('/api/cdn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: formattedUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error detecting CDN:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while checking CDN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
          <h2 className="text-xl font-semibold mb-2">CDN Checker</h2>
          <p className="text-muted-foreground">Enter a website URL to check if it's using a Content Delivery Network (CDN) and identify which one.</p>
        </div>
        
        <div className="mt-6 bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-medium mb-4">Check CDN Usage</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && detectCdn()}
              className="flex-1 min-w-0 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            <button 
              onClick={detectCdn} 
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check CDN'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-md">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Results for: {result.url}</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Using CDN:</span>
                    <span className={result.isUsingCdn ? 'text-green-600 font-medium' : 'text-red-600'}>
                      {result.isUsingCdn ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  {result.cdn && (
                    <div className="flex justify-between">
                      <span>CDN Provider:</span>
                      <span className="font-medium">{result.cdn}</span>
                    </div>
                  )}
                  
                  {result.details?.serverHeader && (
                    <div className="flex justify-between">
                      <span>Server Header:</span>
                      <span>{result.details.serverHeader}</span>
                    </div>
                  )}
                  
                  {result.details?.xCdnHeader && (
                    <div className="flex justify-between">
                      <span>X-CDN Header:</span>
                      <span>{result.details.xCdnHeader}</span>
                    </div>
                  )}
                  
                  {result.details?.viaHeader && (
                    <div className="flex justify-between">
                      <span>Via Header:</span>
                      <span>{result.details?.viaHeader}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}