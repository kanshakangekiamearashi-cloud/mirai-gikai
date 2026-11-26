import Image from "next/image";

export function About() {
  return (
    <div className="py-10">
      <div className="flex flex-col gap-4">
        {/* ヘッダー */}
        <div className="flex flex-col gap-4">
          <h2>
            <Image
              src="/icons/about-typography.svg"
              alt="About"
              width={143}
              height={36}
              priority
            />
          </h2>
          <p className="text-sm font-bold text-primary-accent">
            みらい議会＠東広島市とは
          </p>
        </div>

        {/* コンテンツ */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-bold leading-[43.2px]">
              東広島市議会での議論を
              <br />
              できる限りわかりやすく
            </h3>
            <p className="text-[15px] leading-[28px] text-black">
              みらい議会＠東広島市は、東広島市議会で今どんな議案が審議され、一般質問で何が問われているか、わかりやすく伝えるプラットフォームです。市議会の公式資料をもとに、議案の内容や審議結果、議員の質問と市の答弁を整理して掲載しています。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
