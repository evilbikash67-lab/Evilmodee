const axios = require('axios');

async function streamCompletion({ modelId, messages, temperature, max_tokens, top_p }, onChunk, signal) {
  const { formatPrompt } = require('../utils/promptFormatter');
  const prompt = formatPrompt(messages);

  const response = await axios({
    method: 'post',
    url: `https://api-inference.huggingface.co/models/${modelId}`,
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    data: {
      inputs: prompt,
      parameters: {
        temperature,
        max_new_tokens: max_tokens,
        top_p,
        return_full_text: false,
        stream: true,
      },
      options: { use_cache: false },
    },
    responseType: 'stream',
    signal,
  });

  return new Promise((resolve, reject) => {
    let buffer = '';
    response.data.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const jsonStr = line.slice(5).trim();
          if (!jsonStr) continue;
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.error) {
              reject(new Error(parsed.error));
              return;
            }
            if (parsed.token && parsed.token.text) {
              onChunk(parsed.token.text);
            }
          } catch (e) { /* skip bad JSON */ }
        }
      }
    });
    response.data.on('end', resolve);
    response.data.on('error', reject);
  });
}

module.exports = { streamCompletion };
