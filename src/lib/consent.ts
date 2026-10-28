import { cookies } from "next/headers";
import { CONSENT_COOKIE, CONSENT_VALUE } from "./consent-constants";

export async function hasConsent(): Promise<boolean> {
  const store = await cookies();
  return store.get(CONSENT_COOKIE)?.value === CONSENT_VALUE;
}
