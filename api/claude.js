export default async function handler(req, res) {
    // Habilitar CORS para o Wix
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Responder OPTIONS para CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Aceitar apenas POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }
    
    try {
        // Extrair API key do corpo da requisição
        const { apiKey, ...body } = req.body;
        
        // Usar API key enviada ou da variável de ambiente
        const CLAUDE_API_KEY = apiKey || process.env.CLAUDE_API_KEY;
        
        if (!CLAUDE_API_KEY) {
            return res.status(400).json({ 
                error: 'API Key não fornecida',
                details: 'Envie apiKey no body ou configure CLAUDE_API_KEY no Vercel'
            });
        }
        
        console.log('Proxy recebendo requisição...');
        
        // Fazer requisição para API do Claude
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        // Log para debug
        console.log('Status da resposta Claude:', response.status);
        
        // Retornar resposta
        res.status(response.status).json(data);
        
    } catch (error) {
        console.error('Erro no proxy:', error);
        res.status(500).json({ 
            error: 'Erro interno do proxy',
            message: error.message,
            details: 'Verifique os logs no Vercel'
        });
    }
}
