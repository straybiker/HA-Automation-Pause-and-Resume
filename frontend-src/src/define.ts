// The bundle can load twice: once as the integration's extra JS and once more
// from a manual dashboard resource. A second customElements.define throws, so
// every element registers through this guard instead of @customElement.
export const define = (
  tag: string,
  element: CustomElementConstructor
): void => {
  if (!customElements.get(tag)) {
    customElements.define(tag, element);
  }
};

/**
 * Fires a bubbling, composed event, like HA's fireEvent.
 *
 * A composed event reaches HA's own listeners on the app root. Internal
 * events therefore start with "automation-pause-": HA listens for names
 * such as "dialog-closed" and reads its own detail from them.
 */
export const fireEvent = <T>(
  node: EventTarget,
  type: string,
  detail: T
): void => {
  node.dispatchEvent(
    new CustomEvent(type, { detail, bubbles: true, composed: true })
  );
};
