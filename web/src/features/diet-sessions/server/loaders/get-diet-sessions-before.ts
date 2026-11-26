import "server-only";

import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { SluggedDietSession } from "../../shared/types";
import { findDietSessionsBefore } from "../repositories/diet-session-repository";

/**
 * 指定した開始日より前に始まった会期を新しい順にすべて取得する。
 *
 * `getPastDietSessions` はアクティブな会期を基準にするが、こちらは任意の
 * 会期（例: トップページの入口に出している会期）を基準に「それより過去」を
 * 取りたい場合に使う。slug のない会期はリンクできないため含まれない。
 */
export async function getDietSessionsBefore(
  startDate: string
): Promise<SluggedDietSession[]> {
  // 失敗結果はキャッシュせず、一覧を出さないだけに留める
  try {
    return await _getCachedDietSessionsBefore(startDate);
  } catch (error) {
    console.error(error);
    return [];
  }
}

const _getCachedDietSessionsBefore = unstable_cache(
  async (startDate: string): Promise<SluggedDietSession[]> =>
    findDietSessionsBefore(startDate),
  ["diet-sessions-before"],
  { revalidate: 3600, tags: [CACHE_TAGS.DIET_SESSIONS] }
);
