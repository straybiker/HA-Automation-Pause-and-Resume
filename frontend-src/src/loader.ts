// The module Home Assistant imports on every page. It loads the card and
// writes a load failure to the Home Assistant log. The frontend catches a
// failed extra module and only prints it to the browser console, which a
// phone app does not show, so nobody would learn why the card is missing.

const CARD_FILE = "automation-pause-card.js";
// The frontend connects after the extra modules start to load.
const WAIT_MS = 120000;
const POLL_MS = 1000;

interface HassLike {
  callService(
    domain: string,
    service: string,
    data: Record<string, unknown>
  ): Promise<unknown>;
}

/** One log line: the error, its first stack lines and the browser. */
export const loadErrorMessage = (error: unknown, userAgent: string): string => {
  const err = error instanceof Error ? error : undefined;
  const text = err ? `${err.name}: ${err.message}` : String(error);
  const stack = (err?.stack ?? "")
    .split("\n")
    .slice(1, 4)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" | ");
  return [
    `automation-pause-card could not load: ${text}`,
    stack && `at ${stack}`,
    `browser: ${userAgent}`,
  ]
    .filter(Boolean)
    .join("\n");
};

/** The card URL next to this module, with the same version query. */
export const cardUrl = (loaderUrl: string): string => {
  const url = new URL(CARD_FILE, loaderUrl);
  url.search = new URL(loaderUrl).search;
  return url.href;
};

const findHass = (): HassLike | undefined =>
  (document.querySelector("home-assistant") as { hass?: HassLike } | null)
    ?.hass;

const report = (message: string): void => {
  const started = Date.now();
  const attempt = (): void => {
    const hass = findHass();
    if (hass) {
      hass
        .callService("system_log", "write", {
          message,
          level: "error",
          logger: "custom_components.automation_pause.card",
        })
        .catch(() => undefined);
    } else if (Date.now() - started < WAIT_MS) {
      setTimeout(attempt, POLL_MS);
    }
  };
  attempt();
};

if (typeof document !== "undefined") {
  import(/* @vite-ignore */ cardUrl(import.meta.url)).catch(
    (error: unknown) => {
      const message = loadErrorMessage(error, navigator.userAgent);
      // The browser console is where a desktop user looks first.
      // eslint-disable-next-line no-console
      console.error(message);
      report(message);
    }
  );
}
