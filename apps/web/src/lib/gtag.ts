// layout.tsxで初期化しているGA4 (window.gtag/dataLayer) にクライアント側からカスタムイベントを送るための薄いヘルパー。
// gtag未初期化（スクリプト読み込み前など）でもエラーにならないよう安全にno-opする。
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params ?? {});
}
