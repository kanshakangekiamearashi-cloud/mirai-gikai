import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { DietSession } from "../../shared/types";
import { findDietSessionBySlug } from "../repositories/diet-session-repository";

/**
 * slugで国会会期を取得
 *
 * 「会期が存在しない」という結果（null）はキャッシュに載せない。
 * 会期の投入前に slug へアクセスがあると null が Data Cache に残り、
 * 投入後も 404 が固定されてしまうため（2026-11-28 に
 * higashihiroshima-r8-2 で発生）、キャッシュ内では見つからない場合に
 * 例外を投げ（unstable_cache は例外をキャッシュしない）、外側で null に
 * 変換する。getPastDietSessions の「失敗結果はキャッシュしない」方針と
 * 同じ考え方。
 */
export async function getDietSessionBySlug(
  slug: string
): Promise<DietSession | null> {
  try {
    return await _getCachedDietSessionBySlug(slug);
  } catch {
    return null;
  }
}

const _getCachedDietSessionBySlug = unstable_cache(
  async (slug: string): Promise<DietSession> => {
    const session = await findDietSessionBySlug(slug);
    if (!session) {
      throw new Error(`Diet session not found for slug: ${slug}`);
    }
    return session;
  },
  // v2: 旧キーには r8-2 の null が残り続けていたため、キーを更新して
  // 汚染されたエントリを切り離す（2026-11-28）
  ["diet-session-by-slug-v2"],
  {
    revalidate: 3600, // 1時間
    tags: [CACHE_TAGS.DIET_SESSIONS],
  }
);
