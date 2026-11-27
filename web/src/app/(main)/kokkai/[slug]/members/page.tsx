import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layouts/container";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import { getBillsByDietSession } from "@/features/bills/server/loaders/get-bills-by-diet-session";
import { chatBillName } from "@/features/bills/shared/utils/chat-bill-name";
import { HomeChatClient } from "@/features/chat/client/components/home-chat-client";
import { CouncilMemberList } from "@/features/council/client/components/council-member-list";
import { getCouncilMembersBySessionId } from "@/features/council/server/loaders/get-council-members-by-session";
import { SessionHero } from "@/features/diet-sessions/server/components/session-hero";
import { getDietSessionBySlug } from "@/features/diet-sessions/server/loaders/get-diet-session-by-slug";
import { routes } from "@/lib/routes";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const session = await getDietSessionBySlug(slug);

  if (!session) {
    return { title: "会期が見つかりません" };
  }

  return {
    title: `${session.name}の議員名簿 | みらい議会`,
    description: `${session.name}時点の議員名簿（会派別）です。`,
  };
}

export default async function DietSessionMembersPage({ params }: Props) {
  const { slug } = await params;
  const session = await getDietSessionBySlug(slug);

  if (!session) {
    notFound();
  }

  const [members, bills, currentDifficulty] = await Promise.all([
    getCouncilMembersBySessionId(session.id),
    getBillsByDietSession(session.id),
    getDifficultyLevel(),
  ]);

  return (
    <div className="bg-mirai-surface-muted">
      {/* ヘッダーバンド（この版のブランドで描画） */}
      <SessionHero label={`${session.name}の議員名簿`} />

      <Container className="py-8">
        <CouncilMemberList session={session} members={members} />
      </Container>

      {/* パンくずリスト */}
      <Container className="py-8">
        <nav className="flex items-center gap-2 text-[15px]">
          <Link href={routes.home()} className="text-black">
            TOP
          </Link>
          <ChevronRight className="h-5 w-5 text-black" />
          <Link href={routes.kokkaiSessionBills(slug)} className="text-black">
            {session.name}の議案
          </Link>
          <ChevronRight className="h-5 w-5 text-black" />
          <span className="text-black">議員名簿</span>
        </nav>
      </Container>

      {/* チャットはトップと同じものを出す。一般質問・議員名簿・委員会の文脈で答える。 */}
      <HomeChatClient
        currentDifficulty={currentDifficulty}
        bills={bills.map((bill) => ({
          name: chatBillName(bill),
          summary: bill.bill_content?.summary,
          tags: bill.tags?.map((tag) => tag.label) ?? [],
        }))}
      />
    </div>
  );
}
