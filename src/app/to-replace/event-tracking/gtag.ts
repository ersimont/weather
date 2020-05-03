import { EventTrackingConfig } from "app/to-replace/event-tracking/event-tracking-config";

export function initializeGtag(config: EventTrackingConfig) {
  const win = window as any;
  win.dataLayer = [];
  // tslint:disable-next-line:only-arrow-functions
  win.gtag = function () {
    if (config.log) {
      console.log("[gtag]", ...arguments);
    }
    win.dataLayer.push(arguments);
  };

  if (config.gaProperty) {
    initializeFromGoogle(config.gaProperty);
  }
}

function initializeFromGoogle(gaProperty: string) {
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaProperty}`;
  script.async = true;
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", gaProperty);
}
