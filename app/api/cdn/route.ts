import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

// Common CDN identifiers in headers
const CDN_PATTERNS = [
  { name: 'Cloudflare', header: 'server', pattern: /cloudflare/i },
  { name: 'Cloudflare', header: 'cf-ray', pattern: /.+/ },
  { name: 'Cloudflare', header: 'cf-cache-status', pattern: /.+/ },
  { name: 'Akamai', header: 'x-akamai', pattern: /.+/ },
  { name: 'Akamai', header: 'x-akamai-transformed', pattern: /.+/ },
  { name: 'Fastly', header: 'x-fastly-request-id', pattern: /.+/ },
  { name: 'Fastly', header: 'x-fastly-backend', pattern: /.+/ },
  { name: 'Amazon CloudFront', header: 'x-amz-cf-id', pattern: /.+/ },
  { name: 'Amazon CloudFront', header: 'x-cache', pattern: /cloudfront/i },
  { name: 'Azure CDN', header: 'x-azure-ref', pattern: /.+/ },
  { name: 'Google Cloud CDN', header: 'x-google-backend-response', pattern: /.+/ },
  { name: 'Google Cloud CDN', header: 'alt-svc', pattern: /google/i },
  { name: 'StackPath', header: 'x-imageprocessor', pattern: /stackpath/i },
  { name: 'KeyCDN', header: 'x-keycdn-cache', pattern: /.+/ },
  { name: 'CDN77', header: 'x-cdn77-object-size', pattern: /.+/ },
  { name: 'CDN77', header: 'x-cdn77-request-time', pattern: /.+/ },
  { name: 'EdgeCast', header: 'ec_custom', pattern: /.+/ },
  { name: 'EdgeCast', header: 'x-ec-custom', pattern: /.+/ },
  { name: 'Sucuri', header: 'x-sucuri-id', pattern: /.+/ },
  { name: 'Sucuri', header: 'x-sucuri-cache', pattern: /.+/ },
  { name: 'Incapsula', header: 'x-cdn', pattern: /incapsula/i },
  { name: 'Incapsula', header: 'x-iinfo', pattern: /.+/ },
  { name: 'Cloudinary', header: 'x-cld-error', pattern: /.+/ },
  { name: 'ImageKit', header: 'x-imagekit-server', pattern: /.+/ },
];

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return Response.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Make a HEAD request to get headers without downloading content
    const response = await fetch(parsedUrl.toString(), {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CDN-Detector/1.0)'
      },
      redirect: 'follow' // Follow redirects to check final destination
    });

    // Get response headers
    const responseHeaders = Object.fromEntries(response.headers.entries());
    
    // Look for CDN indicators in headers
    let detectedCdn = null;
    let isUsingCdn = false;

    for (const pattern of CDN_PATTERNS) {
      const headerValue = responseHeaders[pattern.header];
      if (headerValue && pattern.pattern.test(headerValue)) {
        detectedCdn = pattern.name;
        isUsingCdn = true;
        break;
      }
    }

    // Additional checks for CDN detection beyond headers
    if (!isUsingCdn) {
      // Check for common CDN hostnames in the response URL (after redirects)
      const finalUrl = response.url;
      const cdnHostnames = [
        '.cloudflare.com',
        '.akamai.net',
        '.edgekey.net',
        '.akamaized.net',
        '.amazonaws.com',
        '.cloudfront.net',
        '.fastly.net',
        '.stackpathdns.com',
        '.cdn77.com',
        '.incapdns.net',
        '.sucuri.net',
        '.googleusercontent.com',
        '.gstatic.com'
      ];

      for (const hostname of cdnHostnames) {
        if (finalUrl.includes(hostname)) {
          isUsingCdn = true;
          detectedCdn = 'Unknown (Based on hostname)';
          break;
        }
      }
    }

    // Extract specific headers that indicate CDN usage
    const details = {
      serverHeader: responseHeaders['server'] || undefined,
      xCdnHeader: responseHeaders['x-cdn'] || undefined,
      viaHeader: responseHeaders['via'] || undefined,
      cacheControl: responseHeaders['cache-control'] || undefined,
      age: responseHeaders['age'] || undefined,
      xCache: responseHeaders['x-cache'] || undefined,
      xCacheStatus: responseHeaders['x-cache-status'] || undefined,
      cfRay: responseHeaders['cf-ray'] || undefined,
      cfCacheStatus: responseHeaders['cf-cache-status'] || undefined,
      xAmzCfId: responseHeaders['x-amz-cf-id'] || undefined,
      xAzureRef: responseHeaders['x-azure-ref'] || undefined,
      xFastlyRequestId: responseHeaders['x-fastly-request-id'] || undefined,
      xAkamaiTransformed: responseHeaders['x-akamai-transformed'] || undefined,
    };

    return Response.json({
      url: parsedUrl.toString(),
      cdn: detectedCdn,
      isUsingCdn,
      details,
      finalUrl: response.url
    });
  } catch (error) {
    console.error('Error detecting CDN:', error);
    return Response.json({ error: 'Failed to detect CDN' }, { status: 500 });
  }
}