// tslint:disable:only-arrow-functions

export function initializeGtag(gaProperty?: string) {
  if (gaProperty) {
    initializeFromGoogle(gaProperty);
  } else {
    initializeForLogging();
  }

  gtag("js", new Date());
  gtag("config", gaProperty);
}

function initializeFromGoogle(gaProperty: string) {
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaProperty}`;
  script.async = true;
  document.head.appendChild(script);

  const win = window as any;
  win.dataLayer = [];
  win.gtag = function () {
    win.dataLayer.push(arguments);
  };
}

function initializeForLogging() {
  window.gtag = function () {
    console.log("[gtag]", ...arguments);
  };
}
