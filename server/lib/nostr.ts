import WebSocket from 'ws';

const LANA_RELAYS = [
  'wss://relay.lanavault.space',
  'wss://relay.lanacoin-eternity.com',
];

export interface Kind0Profile {
  name?: string;
  display_name?: string;
  picture?: string;
  about?: string;
  currency?: string;
  language?: string;
  country?: string;
  location?: string;
  lanaWalletID?: string;
  lanoshi2lash?: string;
  whoAreYou?: string;
  orgasmic_profile?: string;
  statement_of_responsibility?: string;
  email?: string;
  phone?: string;
  phone_country_code?: string;
  payment_methods?: any[];
  preferred_payout?: string;
  preferred_collect?: string;
  bankName?: string;
  bankAddress?: string;
  bankSWIFT?: string;
  bankAccount?: string;
}

export async function fetchKind0Profile(hexId: string): Promise<Kind0Profile | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 6000);
    let resolved = false;

    for (const relayUrl of LANA_RELAYS) {
      let ws: InstanceType<typeof WebSocket>;
      try {
        ws = new WebSocket(relayUrl);
      } catch {
        continue;
      }

      const subId = `kind0_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

      ws.on('open', () => {
        ws.send(JSON.stringify(['REQ', subId, { kinds: [0], authors: [hexId], limit: 1 }]));
      });

      ws.on('message', (data: Buffer) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg[0] === 'EVENT' && msg[1] === subId && !resolved) {
            const event = msg[2];
            if (event.kind === 0) {
              resolved = true;
              clearTimeout(timeout);
              ws.close();
              try {
                const content = JSON.parse(event.content);
                resolve(content as Kind0Profile);
              } catch {
                resolve(null);
              }
            }
          }
          if (msg[0] === 'EOSE' && !resolved) ws.close();
        } catch {}
      });

      ws.on('error', () => { try { ws.close(); } catch {} });
    }
  });
}

export interface NostrEvent {
  id: string;
  pubkey: string;
  kind: number;
  created_at: number;
  content: string;
  tags: string[][];
}

/**
 * Fetch NIP-52 calendar events (KIND 36677) from the LANA relays.
 * Collects raw events from all relays, de-duplicated by event id.
 * Same source the lanaconnects.us "Prihajajoči dogodki" section reads.
 */
export async function fetchCalendarEvents(limit = 100): Promise<NostrEvent[]> {
  const collected = new Map<string, NostrEvent>();

  await Promise.all(
    LANA_RELAYS.map(
      (relayUrl) =>
        new Promise<void>((res) => {
          let ws: InstanceType<typeof WebSocket>;
          try {
            ws = new WebSocket(relayUrl);
          } catch {
            return res();
          }

          const subId = `cal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const timer = setTimeout(() => {
            try { ws.close(); } catch {}
            res();
          }, 9000);

          ws.on("open", () => {
            ws.send(JSON.stringify(["REQ", subId, { kinds: [36677], limit }]));
          });

          ws.on("message", (data: Buffer) => {
            try {
              const msg = JSON.parse(data.toString());
              if (msg[0] === "EVENT" && msg[1] === subId) {
                const e = msg[2] as NostrEvent;
                if (e && e.id && e.kind === 36677) collected.set(e.id, e);
              }
              if (msg[0] === "EOSE" && msg[1] === subId) {
                clearTimeout(timer);
                try { ws.close(); } catch {}
                res();
              }
            } catch {}
          });

          ws.on("error", () => {
            clearTimeout(timer);
            try { ws.close(); } catch {}
            res();
          });
        })
    )
  );

  return Array.from(collected.values());
}

export async function broadcastEvent(event: any): Promise<{ success: string[]; failed: string[] }> {
  const success: string[] = [];
  const failed: string[] = [];

  await Promise.all(
    LANA_RELAYS.map(
      (relayUrl) =>
        new Promise<void>((res) => {
          let ws: InstanceType<typeof WebSocket>;
          try {
            ws = new WebSocket(relayUrl);
          } catch {
            failed.push(relayUrl);
            return res();
          }

          const timer = setTimeout(() => {
            failed.push(relayUrl);
            try { ws.close(); } catch {}
            res();
          }, 8000);

          ws.on('open', () => {
            ws.send(JSON.stringify(['EVENT', event]));
          });

          ws.on('message', (data: Buffer) => {
            try {
              const msg = JSON.parse(data.toString());
              if (msg[0] === 'OK') {
                clearTimeout(timer);
                if (msg[2] === true) success.push(relayUrl);
                else failed.push(relayUrl);
                ws.close();
                res();
              }
            } catch {}
          });

          ws.on('error', () => {
            clearTimeout(timer);
            failed.push(relayUrl);
            res();
          });
        })
    )
  );

  return { success, failed };
}
