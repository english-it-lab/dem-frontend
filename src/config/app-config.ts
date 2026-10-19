type RuntimeConfigKey =
  | "VITE_API_BASE_URL"
  | "VITE_ADMIN_PAGE_ENABLED"
  | "VITE_AUTH_ENABLED";

type RuntimeConfig = Partial<Record<RuntimeConfigKey, string>>;

const runtimeConfig = (
  globalThis as typeof globalThis & {
    __APP_CONFIG__?: RuntimeConfig;
  }
).__APP_CONFIG__;

/**
 * Runtime config (`config.js`, substituted at container start) wins over the
 * build-time Vite env. Empty strings count as "not set" so an unset variable in
 * the container falls back to the build-time value and then to the default.
 */
const readSetting = (key: RuntimeConfigKey): string | undefined => {
  const runtimeValue = runtimeConfig?.[key]?.trim();

  if (runtimeValue) {
    return runtimeValue;
  }

  const buildValue = (import.meta.env[key] as string | undefined)?.trim();

  return buildValue || undefined;
};

export const apiBaseUrl = readSetting("VITE_API_BASE_URL") ?? "/api/v1";

export const adminPageEnabled =
  readSetting("VITE_ADMIN_PAGE_ENABLED") === "true";

export const authEnabled = readSetting("VITE_AUTH_ENABLED") !== "false";
