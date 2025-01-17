const harmCategory = [
    "HARM_CATEGORY_HATE_SPEECH",
    "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "HARM_CATEGORY_DANGEROUS_CONTENT",
    "HARM_CATEGORY_HARASSMENT",
    "HARM_CATEGORY_CIVIC_INTEGRITY",
];

const safetySettings = (modelName: string) => {
    let threshold = modelName?.includes('2.0') ? 'OFF' : 'BLOCK_NONE';
    return harmCategory.map(category => ({
        category,
        threshold: category === "HARM_CATEGORY_CIVIC_INTEGRITY" ? "BLOCK_ONLY_HIGH" : threshold
    }));
};

function isGenerateContentRequest(url: URL): boolean {
    return url.pathname.endsWith(':generateContent') || url.pathname.endsWith(':streamGenerateContent');
}

async function handler(request: Request): Promise<Response> {
    const url = new URL(request.url);
    url.host = 'generativelanguage.googleapis.com';
  
    if (!(request.method === 'POST' || isGenerateContentRequest(url))) return fetch(new Request(url, request))
  
    const modelName = url.pathname.split('/').pop()?.split(':')[0];
    let oldBody = {};
    try {
        oldBody = await request.json();
    } catch (e) {
    }

    const body = modelName ? {
        ...(oldBody), 
        safetySettings: safetySettings(modelName)
    } : oldBody;

    return fetch(new Request(url, {
        ...request,
        body: JSON.stringify(body)
    }));
}

Deno.serve(handler);
