/**
 * ページレイアウトに関するユーティリティ
 *
 * TOP・法案一覧・法案詳細を「メインページ」として扱い、
 * - チャットサイドバー用のオフセットレイアウトを使用
 *
 * DifficultySelectorの表示可否は isDifficultySelectorPage で判定する
 * （メインページに加え、議会セッションページでも表示する）。
 */

/** メインページ（TOP、法案一覧、法案詳細）かどうかを判定 */
export function isMainPage(pathname: string): boolean {
  // トップページ
  if (pathname === "/") return true;
  // 法案一覧ページ
  if (pathname === "/bills") return true;
  // 法案詳細ページ（/bills/[id]）- サブパスは除外
  if (/\/bills\/[^/]+$/.test(pathname)) return true;
  return false;
}

/**
 * DifficultySelectorを表示するページかどうかを判定
 *
 * メインページに加え、議会セッション配下のページ
 * （/kokkai/[slug]/bills・questions・members）でも表示する。
 * 難易度はCookieで保持される全体設定のため、これらのページでも
 * 同じ切り替え操作ができるようにする。サイドバーレイアウトの
 * 判定（isMainPage）とは切り離し、レイアウトには影響させない。
 */
export function isDifficultySelectorPage(pathname: string): boolean {
  if (isMainPage(pathname)) return true;
  // 議会セッションページ（議案一覧・一般質問・議員名簿）
  if (/^\/kokkai\/[^/]+\/(bills|questions|members)$/.test(pathname)) {
    return true;
  }
  return false;
}

/** インタビューチャットページかどうかを判定 */
export function isInterviewPage(pathname: string): boolean {
  // /bills/[id]/interview/chat
  return /\/bills\/[^/]+\/interview\/chat$/.test(pathname);
}

/** インタビューセクション（LP・チャット含む）かどうかを判定 */
export function isInterviewSection(pathname: string): boolean {
  // /bills/[id]/interview 以下すべて
  return /\/bills\/[^/]+\/interview(\/|$)/.test(pathname);
}

/** インタビューページからbillIdを抽出 */
export function extractBillIdFromPath(pathname: string): string | null {
  const match = pathname.match(/\/bills\/([^/]+)/);
  return match ? match[1] : null;
}
