import { useSyncExternalStore } from "react";

const subscribe = (cb) => {
  addEventListener("online", cb);
  addEventListener("offline", cb);
  return () => {
    removeEventListener("online", cb);
    removeEventListener("offline", cb);
  };
};

/** True while the device has a network connection. */
export const useOnline = () => useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
