/**
 * このサイト（東広島市版）についての説明。
 *
 * 本家の「チームみらいについて」に代えて、このフォーク自体の運営形態と
 * 出典を短く示す。詳細な免責はフッターにも記載している。
 */
export function AboutThisEdition() {
  return (
    <div className="py-10">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-bold text-primary-accent">
          みらい議会＠東広島市について
        </p>
        <div className="flex flex-col gap-3">
          <p className="text-[15px] leading-[28px] text-black">
            「みらい議会＠東広島市」は、東広島市議会の議案や一般質問をわかりやすく伝える、非公式・個人運営のサービスです。掲載内容は、東広島市議会が公表している公式資料に基づきます。
          </p>
          <p className="text-[15px] leading-[28px] text-black">
            本家「みらい議会」（チームみらい）のオープンソースをフォークして作られています。政党チームみらいが運営しているものではありません。
          </p>
        </div>
      </div>
    </div>
  );
}
