import { ExternalLink } from "lucide-react";
import { SEIMU_KATSUDOHI_R7 } from "../../shared/data/seimu-katsudohi-r7";

function yen(value: number): string {
  return `${value.toLocaleString("ja-JP")}円`;
}

/**
 * 政務活動費（会派交付）の収支セクション。
 * 数値は市の公式総括表（令和7年度）の転記。詳細・領収書は公式ページへのリンクで案内する。
 */
export function SeimuKatsudohiSection() {
  const data = SEIMU_KATSUDOHI_R7;
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white px-5 py-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-lg font-bold text-black">
          政務活動費（{data.fiscalYearLabel}・会派別）
        </h2>
        <p className="text-xs font-medium text-mirai-text">
          東広島市では政務活動費は会派に交付されます。金額は市議会公式サイトの「
          {data.fiscalYearLabel}東広島市政務活動費収支報告総括表」の転記です。
          返還額には会派間の調整額や議員辞職に伴う返還の反映分を含みます。
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mirai-border text-left text-mirai-text">
              <th className="py-2 pr-3 font-bold">会派</th>
              <th className="py-2 pr-3 text-right font-bold">交付額</th>
              <th className="py-2 pr-3 text-right font-bold">支出額</th>
              <th className="py-2 pr-3 text-right font-bold">返還額</th>
              <th className="py-2 text-right font-bold">自己負担額</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr
                key={row.faction}
                className="border-b border-mirai-border text-mirai-text"
              >
                <td className="py-2 pr-3 font-bold text-black">
                  {row.faction}
                </td>
                <td className="py-2 pr-3 text-right">{yen(row.granted)}</td>
                <td className="py-2 pr-3 text-right">{yen(row.spent)}</td>
                <td className="py-2 pr-3 text-right">{yen(row.returned)}</td>
                <td className="py-2 text-right">{yen(row.selfPaid)}</td>
              </tr>
            ))}
            <tr className="font-bold text-black">
              <td className="py-2 pr-3">合計</td>
              <td className="py-2 pr-3 text-right">
                {yen(data.total.granted)}
              </td>
              <td className="py-2 pr-3 text-right">{yen(data.total.spent)}</td>
              <td className="py-2 pr-3 text-right">
                {yen(data.total.returned)}
              </td>
              <td className="py-2 text-right">{yen(data.total.selfPaid)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        <a
          href={data.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-bold text-primary underline"
        >
          会派別の収支報告書・領収書など詳しくは市議会公式サイトへ
          <ExternalLink className="h-4 w-4" />
        </a>
      </p>
    </section>
  );
}
