const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 4000; // Proxy server will run on localhost:4000

// Enable CORS for all incoming requests
app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
    const { model, prompt, max_tokens } = req.body;

    try {
        const response = await axios.post(
            'http://localhost:11434/api/generate', // Proxy request to Ollama API
            { model, prompt, max_tokens },
            { responseType: 'stream' }
        );

        let fullResponse = '';

        response.data.on('data', (chunk) => {
            const parsedChunk = JSON.parse(chunk.toString());
            if (parsedChunk.response) {
                fullResponse += parsedChunk.response;
            }
        });

        response.data.on('end', () => {
            res.json({ response: fullResponse.trim() });
        });
    } catch (error) {
        console.error('Error interacting with Ollama API:', error);
        res.status(500).json({ error: 'Failed to get a response from the chatbot.' });
    }
});

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
