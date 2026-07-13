// Convert messages array to a prompt string for Hugging Face models.
// This is a generic template; adjust based on model's expected format.
function formatPrompt(messages) {
  return messages.map(msg => {
    if (msg.role === 'system') return `<|system|>\n${msg.content}\n`;
    if (msg.role === 'user') return `<|user|>\n${msg.content}\n`;
    if (msg.role === 'assistant') return `<|assistant|>\n${msg.content}\n`;
    return '';
  }).join('') + '<|assistant|>\n';
}

module.exports = { formatPrompt };
