export interface StreamingChatRequest {
  message: string;
  chatId?: string;
}

export interface StreamingChatResponse {
  content: string;
  done: boolean;
  chatId?: string;
}

export async function* streamChatResponse(request: StreamingChatRequest) {
  const response = await fetch('/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        
        try {
          // Handle Server-Sent Events format
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            const parsed: StreamingChatResponse = JSON.parse(data);
            yield parsed;
          } else {
            // Handle plain JSON lines
            const parsed: StreamingChatResponse = JSON.parse(line);
            yield parsed;
          }
        } catch (e) {
          console.warn('Failed to parse streaming response:', line, e);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Hook for using streaming with React Query
export function useStreamingChat() {
  const streamChat = async (
    request: StreamingChatRequest,
    onChunk: (chunk: StreamingChatResponse) => void
  ) => {
    try {
      for await (const chunk of streamChatResponse(request)) {
        onChunk(chunk);
      }
    } catch (error) {
      throw error;
    }
  };

  return { streamChat };
}