async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  url.host = 'generativelanguage.googleapis.com';
  return fetch(new Request(url, request));
}

Deno.serve(handler);
