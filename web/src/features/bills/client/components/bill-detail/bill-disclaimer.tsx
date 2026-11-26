export function BillDisclaimer() {
  return (
    <div className="space-y-6 pt-4 pb-10">
      {/* データの出典について */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-black">掲載コンテンツについて</h3>
        <p className="text-xs leading-relaxed text-mirai-text-note">
          掲載されている議案情報は、東広島市議会が公表している議案・会議録・議会だよりなどの公開情報を基に、内容を整理したものです。
        </p>
        <p className="text-xs leading-relaxed text-mirai-text-note">
          一般質問の答弁要旨は、議会だよりに掲載された要旨の転記で、会議録の逐語ではありません。要旨が公表されていない項目は、その旨を表示しています。
        </p>
      </div>

      {/* 掲載コンテンツについての免責事項 */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-black">免責事項</h3>
        <p className="text-xs leading-relaxed text-mirai-text-note">
          本サイトで公開する情報は、可能な限り正確かつ最新の情報を反映するよう努めていますが、その正確性・完全性・即時性について保証するものではありません。また、AIチャットは不正確または誤解を招く回答を生成する可能性があります。正確な情報は、公式文書や一次資料をご確認ください。
        </p>
      </div>
    </div>
  );
}
