import { api } from "./api";
import { takePending } from "./auth";

/** Where to go after logging in: a pending join/friend link, Home, or dorm setup. */
export async function afterLogin(navigate) {
  const pending = takePending();
  if (pending) return navigate(pending, { replace: true });
  const me = await api("/me");
  navigate(me.dormId ? "/home" : "/setup/dorm", { replace: true });
}
