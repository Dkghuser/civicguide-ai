export interface RoadmapStep {
  title: string;
  description: string;
  deadline: string;
  status: "pending" | "current" | "completed";
}

export interface RoadmapResponse {
  steps: RoadmapStep[];
  advice: string;
}

export async function generateVoterRoadmap(location: string, age: number): Promise<RoadmapResponse> {
  try {
    const response = await fetch('/api/roadmap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location, age }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from backend API");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    throw error;
  }
}

export async function streamChatMessage(
  message: string, 
  history: any[], 
  onChunk: (text: string) => void
): Promise<void> {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    throw new Error("Failed to connect to chat stream");
  }

  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    
    const chunkStr = decoder.decode(value, { stream: true });
    const lines = chunkStr.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          if (parsed.text) {
            onChunk(parsed.text);
          }
        } catch (e) {
          // ignore parsing error for incomplete chunks
        }
      }
    }
  }
}

export async function updateRoadmapStatus(history: any[], roadmap: RoadmapStep[]): Promise<RoadmapStep[]> {
  try {
    const response = await fetch('/api/roadmap/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, roadmap }),
    });
    if (!response.ok) throw new Error("Failed to fetch roadmap update");
    const data = await response.json();
    return Array.isArray(data) ? data : data.steps || roadmap;
  } catch (err) {
    console.error("Error updating roadmap status:", err);
    return roadmap;
  }
}
