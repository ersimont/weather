export class DomContext {
  click(element: HTMLElement) {
    this.dispatchMouseEvent('mousedown', element);
    this.dispatchMouseEvent('mouseup', element);
    this.dispatchMouseEvent('click', element);
  }

  setText(text: string, element: HTMLInputElement) {
    element.value = text;
    this.dispatch(new InputEvent('input', { bubbles: true }), element);
  }

  // pressKey(key: string) {
  //   this.dispatchKeyboardEvent("keydown", { key });
  //   this.dispatchKeyboardEvent("keyup", { key });
  // }

  // dispatchKeyboardEvent(type: string, init: KeyboardEventInit = {}) {
  //   assert(document.activeElement, "Nothing has keyboard focus");
  //   this.dispatchEvent(
  //     new KeyboardEvent(type, {
  //       ...init,
  //       cancelable: true,
  //       bubbles: true,
  //     }),
  //     document.activeElement,
  //   );
  // }

  dispatchMouseEvent(
    type: string,
    element: Element,
    init: MouseEventInit = {},
  ) {
    this.dispatch(
      new MouseEvent(type, { ...init, bubbles: true, cancelable: true }),
      element,
    );
  }

  dispatchChange(element: Element, init: EventInit = {}) {
    this.dispatch(new Event('change', { ...init, bubbles: true }), element);
  }

  dispatch(event: Event, element: Element) {
    element.dispatchEvent(event);
  }
}
