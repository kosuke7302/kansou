// スレ機能の試験運用対象（作品slug）。対象外の作品ではスレ関連の画面・操作を出さない
export const THREAD_PILOT_SLUGS: readonly string[] = ["kinnikuman", "one-punch-man-manga"];

export function isThreadPilot(slug: string): boolean {
  return THREAD_PILOT_SLUGS.includes(slug);
}
