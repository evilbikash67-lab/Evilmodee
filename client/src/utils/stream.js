export async function streamChatCompletion(alias, messages, onChunk, onDone, onError, signal) {
  const response = await fetch('/api/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alias, messages }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Unknown error');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6);
        if (dataStr === '[DONE]') {
          onDone();
          return;
        }
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.error) {
            onError(new Error(parsed.error));
            return;
          }
          if (parsed.content) onChunk(parsed.content);
        } catch (e) {}
      }
    }
  }
  onDone();
}
