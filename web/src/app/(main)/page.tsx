import { Container } from "@/components/layouts/container";
import { About } from "@/components/top/about";
import { AboutThisEdition } from "@/components/top/about-this-edition";
import { ComingSoonSection } from "@/components/top/coming-soon-section";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import { BillDisclaimer } from "@/features/bills/client/components/bill-detail/bill-disclaimer";
import { BillSearchOverlay } from "@/features/bills/client/components/bill-search-overlay";
import { BillsByTagSection } from "@/features/bills/server/components/bills-by-tag-section";
import { CategoryTabs } from "@/features/bills/server/components/category-tabs";
import { InterviewOpenBillSection } from "@/features/bills/server/components/interview-open-bill-section";
import { NotableBillSection } from "@/features/bills/server/components/notable-bill-section";
import { getBillSearchData } from "@/features/bills/server/loaders/get-bill-search-data";
import { getNotableBills } from "@/features/bills/server/loaders/get-notable-bills";
import { loadHomeData } from "@/features/bills/server/loaders/load-home-data";
import type { BillWithContent } from "@/features/bills/shared/types";
import { chatBillName } from "@/features/bills/shared/utils/chat-bill-name";
import { pickHomeSections } from "@/features/bills/shared/utils/pick-home-sections";
import { HomeChatClient } from "@/features/chat/client/components/home-chat-client";
import { CouncilSessionEntrySection } from "@/features/council/server/components/council-session-entry-section";
import { PastCouncilSessionsSection } from "@/features/council/server/components/past-council-sessions-section";
import { getCouncilSessionSummary } from "@/features/council/server/loaders/get-council-session-summary";
import { getPastCouncilSessionEntries } from "@/features/council/server/loaders/get-past-council-session-entries";
import { CurrentDietSession } from "@/features/diet-sessions/client/components/current-diet-session";
import { getCurrentDietSession } from "@/features/diet-sessions/server/loaders/get-current-diet-session";
import { getLatestClosedDietSession } from "@/features/diet-sessions/server/loaders/get-latest-closed-diet-session";
import { getJapanTime } from "@/lib/utils/date";

/** カテゴリタブの「注目」から飛ばす先。 */
const FEATURED_ANCHOR = "featured";

export default async function Home() {
  const japanTime = getJapanTime();
  // ゆくゆくタグ機能がマージされたらBFFに統合する
  const [
    { billsByTag, interviewOpenBills, comingSoonBills },
    currentSession,
    latestClosedSession,
    currentDifficulty,
    searchData,
  ] = await Promise.all([
    loadHomeData(),
    getCurrentDietSession(japanTime),
    getLatestClosedDietSession(japanTime),
    getDifficultyLevel(),
    getBillSearchData(),
  ]);

  // 会期入口セクションの対象は、開催中の会期→無ければ直近に閉会した会期。
  // slug が無い会期は会期ページへリンクできないので対象にしない。
  const entrySession = currentSession ?? latestClosedSession;
  const entrySlug = entrySession?.slug ?? null;
  const sessionSummary =
    entrySession && entrySlug
      ? await getCouncilSessionSummary(entrySession.id, currentDifficulty)
      : null;

  // 注目の議案は入口の会期から取得する（委員会質疑・賛否が分かれた議案）。
  const notableBills = entrySession
    ? await getNotableBills(entrySession.id)
    : [];

  // 過去の定例会への入口。入口の会期より前の会期をDBから取得する。
  const pastEntries = entrySession
    ? await getPastCouncilSessionEntries(entrySession, currentDifficulty)
    : [];

  const { tagGroups, shownBills, featuredBillIds } = pickHomeSections({
    billsByTag,
    featuredBills: notableBills,
    interviewOpenBills,
  });

  const toBillChatContext = (bill: BillWithContent) => {
    return {
      name: chatBillName(bill),
      summary: bill.bill_content?.summary,
      tags: bill.tags?.map((tag) => tag.label) || [],
      isFeatured: featuredBillIds.has(bill.id),
    };
  };

  return (
    <>
      {/* 東広島市議会の会期セクション */}
      <CurrentDietSession
        session={currentSession}
        closedSession={latestClosedSession}
        now={japanTime}
      />

      {/* 会期の収録（議案・一般質問・議員名簿）への入口 */}
      {entrySession && entrySlug && sessionSummary && (
        <CouncilSessionEntrySection
          session={{ ...entrySession, slug: entrySlug }}
          summary={sessionSummary}
        />
      )}

      <Container>
        <div className="pt-4">
          <CategoryTabs
            billsByTag={billsByTag}
            featuredAnchor={
              notableBills.length > 0 ? FEATURED_ANCHOR : undefined
            }
          />
        </div>
        {/* 検索の入口。キーワードとテーマの両方をモーダルに並べる */}
        <div className="flex justify-end pt-2">
          <BillSearchOverlay {...searchData} />
        </div>
      </Container>

      {/* 議案一覧セクション */}
      <Container className="">
        <div className="py-10">
          <main className="flex flex-col gap-16">
            {/*
              AIインタビュー受付中セクション。意見を出せる法案を最初に見せる。
              会期では絞らない（閉会中でも受付中なら案内する）。
            */}
            <InterviewOpenBillSection bills={interviewOpenBills} />

            {/* 注目の議案セクション */}
            {notableBills.length > 0 && (
              <section id={FEATURED_ANCHOR}>
                <NotableBillSection bills={notableBills} />
              </section>
            )}

            {/* タグ別議案一覧セクション */}
            <BillsByTagSection billsByTag={tagGroups} />

            {/* Coming soonセクション */}
            <ComingSoonSection bills={comingSoonBills} />
          </main>
        </div>
      </Container>

      {/* 過去の定例会（議案・一般質問）への入口 */}
      {pastEntries.length > 0 && (
        <PastCouncilSessionsSection entries={pastEntries} />
      )}

      {/*
        本家の Archive（前回会期の議案＋過去の会期一覧）は出さない。
        過去の定例会セクションと対象が重なり、同じ会期・議案が二重に並ぶため。
      */}
      <Container>
        {/* みらい議会とは セクション */}
        <About />

        {/* みらい議会＠東広島市について セクション */}
        <AboutThisEdition />

        {/* 免責事項 */}
        <BillDisclaimer />
      </Container>

      {/* チャット機能 */}
      <HomeChatClient
        currentDifficulty={currentDifficulty}
        bills={shownBills.map(toBillChatContext)}
      />
    </>
  );
}
