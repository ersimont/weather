import { onRequest } from 'firebase-functions/v2/https';

// E.g.: {
//   "path": "/location-iq/",
//   "baseUrl": "https://us1.locationiq.com/",
//   "params": { "key": "abc123" }
// }
interface Route {
  path: string;
  baseUrl: string;
  params: Record<string, string>;
}

export const api = onRequest({ secrets: ['ROUTES'] }, async (req, res) => {
  const config: Route[] = JSON.parse(process.env.ROUTES!);
  const route = config.find(({ path }) => req.path.startsWith(path));
  if (!route) {
    console.error('Route not found:', req.path);
    res.status(404).json({ error: 'Route not found' });
    return;
  }

  const query = req.query as Record<string, string>;
  const params = new URLSearchParams({ ...route.params, ...query });
  const url = `${req.path.replace(route.path, route.baseUrl)}?${params}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error({ error, path: route.path, query: req.query });
    res.status(500).json({ error: error.message });
  }
});
