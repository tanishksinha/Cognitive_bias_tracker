import { useCallback } from "react";
import axios from "../api/axios";

export function useEventLogger(decisionId) {
  const logEvent = useCallback(async (type, payload = {}) => {
    if (!decisionId) return;
    try {
      await axios.post(`/api/decisions/${decisionId}/events`, {
        event_type: type,
        event_payload: payload,
      });
    } catch {
      // Event logging is best-effort — never block the UI
    }
  }, [decisionId]);

  return { logEvent };
}
