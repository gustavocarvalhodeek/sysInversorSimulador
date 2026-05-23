const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function isEscapeDismissKey(key) {
  return key === "Escape";
}

export function getResponsivePanelWidth(maxWidthPx, viewportInsetPx = 32) {
  return `min(${maxWidthPx}px, calc(100vw - ${viewportInsetPx}px))`;
}

export function getResponsivePanelMaxHeight(maxHeightPx, viewportInsetPx = 48) {
  return `min(${maxHeightPx}px, calc(100vh - ${viewportInsetPx}px))`;
}

export function getWrappedFocusIndex(currentIndex, delta, length) {
  if (!Number.isInteger(length) || length <= 0) {
    return -1;
  }

  const normalizedCurrent = currentIndex < 0 ? (delta > 0 ? -1 : 0) : currentIndex;
  return (normalizedCurrent + delta + length) % length;
}

export function getFocusableElements(container) {
  if (!container?.querySelectorAll) {
    return [];
  }

  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter((element) => {
    if (element.disabled || element.getAttribute("aria-hidden") === "true") {
      return false;
    }

    if (!element.isConnected) {
      return false;
    }

    if (typeof window !== "undefined" && typeof window.getComputedStyle === "function") {
      const style = window.getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden") {
        return false;
      }
    }

    return true;
  });
}

export function trapFocusWithin(event, container) {
  if (event.key !== "Tab") {
    return false;
  }

  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) {
    return false;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = container.ownerDocument?.activeElement ?? null;

  if (event.shiftKey) {
    if (activeElement === firstElement || !container.contains(activeElement)) {
      event.preventDefault();
      lastElement.focus();
      return true;
    }

    return false;
  }

  if (activeElement === lastElement || !container.contains(activeElement)) {
    event.preventDefault();
    firstElement.focus();
    return true;
  }

  return false;
}

export function scheduleFocus(targetRef) {
  const focusTarget = targetRef?.current;
  if (typeof focusTarget?.focus !== "function") {
    return;
  }

  if (
    typeof window !== "undefined" &&
    typeof window.requestAnimationFrame === "function"
  ) {
    window.requestAnimationFrame(() => {
      targetRef.current?.focus?.();
    });
    return;
  }

  focusTarget.focus();
}
