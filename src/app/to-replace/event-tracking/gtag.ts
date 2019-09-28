export function initializeGtag(gaProperty?: string) {
  const win = window as any;

  if (gaProperty) {
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaProperty}`;
    script.async = true;
    document.head.appendChild(script);

    win.dataLayer = [];
    win.gtag = function() {
      win.dataLayer.push(arguments);
    };
  } else {
    win.gtag = function() {
      console.log("[gtag]", ...arguments);
    };
  }

  gtag("js", new Date());
  gtag("config", gaProperty);
}
