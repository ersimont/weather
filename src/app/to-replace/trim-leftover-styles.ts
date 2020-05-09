const initialStyles = new Set(Array.from(document.querySelectorAll('style')));

export function trimLeftoverStyles() {
  for (const style of Array.from(document.querySelectorAll('style'))) {
    if (!initialStyles.has(style)) {
      style.remove();
    }
  }
}
