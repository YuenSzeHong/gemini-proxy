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
    
    console.log('Method:', request.method);
    console.log('URL:', url.toString());
    console.log('Is generate content:', isGenerateContentRequest(url));

    if (!(request.method === 'POST' && isGenerateContentRequest(url))) {
        console.log('Forwarding non-POST/non-generate request');
        return fetch(url, request);
    }
  
    const modelName = url.pathname.split('/').pop()?.split(':')[0];
    console.log('Model name:', modelName);
    
    let oldBody = {};
    try {
        oldBody = await request.json();
        console.log('Original body:', oldBody);
    } catch (e) {
        console.error('Error parsing body:', e);
    }

    const body = modelName ? {
        ...(oldBody), 
        safetySettings: safetySettings(modelName)
    } : oldBody;
    
    console.log('New body:', body);

    const newRequest = {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(body)
    };
    console.log('New request:', newRequest);

    return fetch(url, newRequest);
}

Deno.serve(handler);
