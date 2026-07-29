export async function onRequest(context) {
  const { request, env, params } = context;

  // Extract path segments after /api/ (e.g. 3/movie/popular)
  const pathSegments = params.path;
  const pathStr = Array.isArray(pathSegments) ? pathSegments.join('/') : (pathSegments || '');

  // Build target TMDB URL
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`https://api.themoviedb.org/${pathStr}`);

  // Copy query parameters except existing api_key
  incomingUrl.searchParams.forEach((value, key) => {
    if (key !== 'api_key') {
      targetUrl.searchParams.set(key, value);
    }
  });

  // Attach secret TMDB API key from Cloudflare Environment Variables
  const apiKey = env.TMDB_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'TMDB_API_KEY environment variable is not configured in Cloudflare Pages.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    );
  }

  targetUrl.searchParams.set('api_key', apiKey);

  try {
    const tmdbResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Cloudflare-Pages-Movie-App'
      }
    });

    const responseBody = await tmdbResponse.arrayBuffer();
    const headers = new Headers(tmdbResponse.headers);
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(responseBody, {
      status: tmdbResponse.status,
      statusText: tmdbResponse.statusText,
      headers
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch from TMDB', details: err.message }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
}
