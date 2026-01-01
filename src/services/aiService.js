
const API_BASE_URL = process.env.REACT_APP_API_URL;

export const streamAIResponse = (prompt, onToken, onComplete, onError) => {
  try {
    const eventSource = new EventSource(
      `${API_BASE_URL}/free-stream-ai?prompt=${encodeURIComponent(prompt)}`
    );

    eventSource.onmessage = (event) => {
      if (event.data === "[END]") {
        eventSource.close();
        if (onComplete) onComplete();
      } else {
        if (onToken) onToken(event.data);
      }
    };

    eventSource.onerror = (err) => {
      console.error("AI Stream Error:", err);
      eventSource.close();
      if (onError) onError(err);
    };

    return eventSource;
  } catch (error) {
    console.error("Error starting AI stream:", error);
    throw error;
  }
};
