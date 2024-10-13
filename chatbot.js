const axios = require('axios');

// Function to interact with local Ollama instance
async function chatWithOllama(message) {
    try {
        // Initiate the request
        const response = await axios.post(
            'http://localhost:11434/api/generate', // Correct endpoint for local API
            {
                model: 'llama3', // Adjust this to the model you're using
                prompt: message,
                max_tokens: 100,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                responseType: 'stream', // Handle stream response
            }
        );

        let fullResponse = '';

        // Listen to the data chunks as they arrive
        response.data.on('data', (chunk) => {
            const parsedChunk = JSON.parse(chunk.toString()); // Parse each chunk

            if (parsedChunk.response) {
                fullResponse += parsedChunk.response; // Append response part
            }
        });

        // Return the full response once all chunks are received
        return new Promise((resolve) => {
            response.data.on('end', () => {
                resolve(fullResponse.trim()); // Return the final concatenated response
            });
        });

    } catch (error) {
        console.error('Error interacting with local Ollama API:', error);
        return 'Sorry, something went wrong!';
    }
}

// Chat loop
async function startChatbot() {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log('Chatbot is running! Type "exit" to stop.');

    readline.on('line', async (input) => {
        if (input.toLowerCase() === 'exit') {
            console.log('Goodbye!');
            readline.close();
            return;
        }

        const botReply = await chatWithOllama(input);
        console.log(`Bot ====>: ${botReply}`);
    });
}

startChatbot();
