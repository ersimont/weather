export class ManualReinstallServiceHarness {
  private referrerSpy?: jasmine.Spy<() => string>;
  private displayModeSpy?: jasmine.Spy<() => MediaQueryList>;

  setToTriggerPopup(shouldTrigger: boolean): void {
    this.setReferrerToTriggerPopup(shouldTrigger);
    this.setDisplayModeToTriggerPopup(shouldTrigger);
  }

  setReferrerToTriggerPopup(shouldTrigger: boolean): void {
    this.referrerSpy ??= spyOnProperty(document, 'referrer');
    this.referrerSpy.and.returnValue(
      shouldTrigger ? 'https://ersimont.github.io/' : 'http://example.com/',
    );
  }

  setDisplayModeToTriggerPopup(shouldTrigger: boolean): void {
    this.displayModeSpy ??= spyOn(window, 'matchMedia').withArgs(
      '(display-mode: standalone)',
    );
    this.displayModeSpy.and.returnValue({ matches: shouldTrigger } as any);
  }
}
