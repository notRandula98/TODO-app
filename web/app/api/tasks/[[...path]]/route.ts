import { NextRequest } from 'next/server';
async function proxy(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
 const { path = [] } = await context.params;
 const base = process.env.API_BASE_URL || 'http://127.0.0.1:4000';
 const url = `${base.replace(/\/$/, '')}/tasks${path.length ? '/' + path.map(encodeURIComponent).join('/') : ''}${request.nextUrl.search}`;
 try {
 const response = await fetch(url, { method: request.method, headers: { 'Content-Type': 'application/json' }, body: ['POST', 'PATCH'].includes(request.method) ? await request.text() : undefined, cache: 'no-store', signal: AbortSignal.timeout(15000) });
 return new Response(response.status === 204 ? null : await response.text(), { status: response.status, headers: { 'Content-Type': 'application/json' } });
 } catch { return Response.json({ message: 'Unable to reach the task service. Check that the API is running and try again.' }, { status: 502 }); }
}
export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE };
