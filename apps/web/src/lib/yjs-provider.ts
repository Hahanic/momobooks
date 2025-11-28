import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";

export const createCollaborationProvider = (docId: string, token: string, doc: Y.Doc) => {
  const wsUrl = import.meta.env.VITE_WS_URL;

  return new HocuspocusProvider({
    url: wsUrl,
    name: docId,
    token: token,
    document: doc,
    onConnect: () => {
      console.log("Hocuspocus connected");
    },
    onAuthenticationFailed: ({ reason }) => {
      console.error("Hocuspocus authentication failed:", reason);
    },
    // onOpen() {
    //   // …
    // },
    // onAuthenticated() {
    //   console.log("Hocuspocus authenticated");
    // },
    // onAuthenticationFailed: ({ reason }) => {
    //   // …
    // },
    // onStatus: ({ status }) => {
    //   // …
    // },
    // onMessage: ({ event, message }) => {
    //   console.log("Hocuspocus message received:", event, message);
    // },
    // onOutgoingMessage: ({ message }) => {
    //   // …
    // },
    // onSynced: ({ state }) => {
    //   // …
    // },
    onClose: ({ event }) => {
      console.log("Hocuspocus connection closed:", event);
    },
    onDisconnect: ({ event }) => {
      console.log("Hocuspocus disconnected:", event);
    },
    // onDestroy() {
    //   // …
    // },
    // onAwarenessUpdate: ({ added, updated, removed }) => {
    //   // …
    // },
    // onAwarenessChange: ({ states }) => {
    //   // …
    // },
    // onStateless: ({ payload }) => {
    //   // ...
    //   // the provider can also send a custom message to the server: provider.sendStateless('any string payload')
    // }
  });
};
