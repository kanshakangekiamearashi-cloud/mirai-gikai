import "server-only";

/**
 * 会期ページ（議案一覧・一般質問・議員名簿）のヘッダーバンド。
 *
 * 上流の国会議事堂写真（/img/archive-hero-7f3d06.png）はバイナリ資産で
 * フォーク側では差し替えできないため、この版のブランド
 * （煉瓦色＝primary × アンティークゴールドのグラデーション）で描画する。
 */
export function SessionHero({ label }: { label: string }) {
  return (
    <div
      className="relative h-[285px] w-full overflow-hidden bg-primary"
      role="img"
      aria-label={label}
    >
      <div className="absolute inset-0 bg-mirai-gradient opacity-25" />
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-8 text-[260px] leading-none font-bold text-white/10 select-none"
      >
        東
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-mirai-gradient" />
    </div>
  );
}
