export class EventTrackingServiceHarness {
  getErrorDescriptions() {
    return this.getEvents()
      .filter((event) => event[1] === "exception")
      .map((event) => event[2].description);
  }

  private getEvents(): Array<["event", string, Record<string, any>]> {
    return (window as any).dataLayer.filter(
      (args: any[]) => args[0] === "event",
    );
  }
}
