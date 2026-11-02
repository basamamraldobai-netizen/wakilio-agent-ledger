import { useEffect, useState } from "react";
import type { TxRecord } from "@/lib/wakilio/engine";

const KEY = "wakilio.v1";
type State = { records: TxRecord[]; aliases: Record<string, string>; dismissed: string[] };
const empty: State = { records: [], aliases: {}, dismissed: [] };

export function useWakilioStore() {
  const [state, setState] = useState<State>(empty);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...empty, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, loaded]);
  return [state, setState] as const;
}
