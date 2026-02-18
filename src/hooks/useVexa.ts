"use client";

import { useState, useCallback, useRef } from 'react';

export type TranscriptionSegment = {
  id: string;
  text: string;
  speaker: string;
  start_time: number;
  end_time: number;
  language: string;
  is_final: boolean;
};

export function useVexaWebSocket(url: string, apiKey: string) {
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [botStatus, setBotStatus] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  const addLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev].slice(0, 50));
    console.log(`[VexaWS] ${msg}`);
  }, []);

  const connect = useCallback((platform: string, nativeId: string) => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const wsUrl = `${url}?api_key=${apiKey}`;
    addLog(`Connecting to: ${wsUrl.split('?')[0]}`);
    
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      addLog("✅ WebSocket connected!");
      setIsConnected(true);
      setSegments([]);
      setBotStatus("joining");

      const subscribeMessage = {
        action: "subscribe",
        meetings: [{ platform, native_id: nativeId }]
      };
      addLog(`Sending subscribe for ${nativeId}...`);
      socket.send(JSON.stringify(subscribeMessage));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'subscribed') {
          addLog("🚀 Subscription confirmed!");
        } else if (data.type === 'meeting.status') {
          const status = data.payload?.status || data.status;
          addLog(`📊 Status: ${status}`);
          
          if (status === 'in_call_not_admitted') {
            setBotStatus("admission");
          } else if (status === 'in_call_recording' || status === 'active') {
            setBotStatus("ready");
          }
        } else if (data.type === 'transcript.mutable' || data.type === 'transcription' || data.type === 'transcript.final') {
          const payload = data.payload || data.segment || data;
          
          if (payload && payload.text) {
            // CLIENT-SIDE HALLUCINATION FILTER
            const blocked = ["terima kasih kerana menonton", "terima kasih sudah menonton", "thanks for watching"];
            if (blocked.some(p => payload.text.toLowerCase().includes(p))) {
              return;
            }

            setSegments((prev) => {
              // ULTRA ROBUST KEY: Using explicit ID or a generated one that's unique per speaker/time
              const rawId = payload.id || `${payload.start_time}-${payload.speaker}`;
              const segmentId = String(rawId);
              
              const index = prev.findIndex((s) => s.id === segmentId);
              
              const normalized: TranscriptionSegment = {
                id: segmentId,
                text: payload.text,
                speaker: payload.speaker || 'Speaker',
                start_time: payload.start_time || 0,
                end_time: payload.end_time || 0,
                language: payload.language || 'id',
                is_final: data.type === 'transcription' || data.type === 'transcript.final' || payload.is_final
              };

              if (index !== -1) {
                const newSegments = [...prev];
                newSegments[index] = normalized;
                return newSegments;
              }
              return [...prev, normalized];
            });
          }
        }
      } catch (err) {
        addLog(`⚠️ Error parsing: ${event.data.substring(0, 50)}`);
      }
    };

    socket.onclose = (event) => {
      addLog(`🔌 Connection closed (Code: ${event.code})`);
      setIsConnected(false);
      setBotStatus(null);
    };

    socketRef.current = socket;
  }, [url, apiKey, addLog]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      setBotStatus(null);
    }
  }, [addLog]);

  return { segments, setSegments, isConnected, botStatus, logs, connect, disconnect, addLog };
}
