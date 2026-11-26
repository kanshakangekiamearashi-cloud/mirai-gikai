import {
  buildOgFontOptions,
  loadNotoSansJp,
  OG_FONT_FAMILY,
} from "@mirai-gikai/shared/og/assets";
import { ImageResponse } from "next/og";

/**
 * みらい議会＠東広島市の OGP 画像。
 *
 * 上流の /ogp.jpg（バイナリ）はフォーク側で差し替えできないため、
 * この版のブランド（深い藍 #203864 × アンティークゴールド #b9975b）で
 * 動的に生成する。フォント取得に失敗した場合はデフォルトフォントで
 * 描画を続行する（buildOgFontOptions が fonts を省略する）。
 */
export const alt =
  "みらい議会＠東広島市 — 東広島市議会の議案・一般質問をわかりやすく";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INDIGO = "#203864";
const INDIGO_DARK = "#14243f";
const GOLD = "#b9975b";
const GOLD_LIGHT = "#efe3c2";

export default async function OpengraphImage() {
  const fontData = await loadNotoSansJp(700);
  const fontOptions = buildOgFontOptions(fontData, 700);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        backgroundImage: `linear-gradient(135deg, ${INDIGO} 0%, ${INDIGO_DARK} 100%)`,
        fontFamily: OG_FONT_FAMILY,
        color: "#ffffff",
      }}
    >
      {/* ロゴマーク＋議会名 */}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <div
          style={{
            width: 128,
            height: 128,
            borderRadius: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
            color: INDIGO,
            fontSize: 76,
            fontWeight: 700,
          }}
        >
          東
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 34, color: GOLD_LIGHT, fontWeight: 700 }}>
            東広島市議会
          </div>
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.75)" }}>
            HIGASHIHIROSHIMA CITY COUNCIL
          </div>
        </div>
      </div>

      {/* サイト名＋説明 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: 2 }}>
          みらい議会＠東広島市
        </div>
        <div style={{ fontSize: 36, color: GOLD_LIGHT }}>
          東広島市議会の議案・一般質問を、わかりやすく。
        </div>
      </div>

      {/* フッター */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            width: "100%",
            height: 4,
            backgroundImage: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
          }}
        />
        <div style={{ fontSize: 24, color: "rgba(255,255,255,0.8)" }}>
          東広島市議会で今どんな議案が検討されているか、わかりやすく伝える非公式プラットフォーム
        </div>
      </div>
    </div>,
    {
      ...size,
      ...fontOptions,
    }
  );
}
