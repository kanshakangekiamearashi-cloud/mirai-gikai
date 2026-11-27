import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layouts/container";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import { getBillsByDietSession } from "@/features/bills/server/loaders/get-bills-by-diet-session";
import { chatBillName } from "@/features/bills/shared/utils/chat-bill-name";
import { HomeChatClient } from "@/features/chat/client/components/home-chat-client";
import { GeneralQuestionList } from "@/features/council/client/components/general-question-list";
import { getGeneralQuestionsBySessionId } from "@/features/council/server/loaders/get-general-questions-by-session";
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
    title: `${session.name}の一般質問 | みらい議会`,
    description: `${session.name}で行われた一般質問と答弁要旨の一覧です。`,
  };
}

export default async function DietSessionQuestionsPage({ params }: Props) {
  const { slug } = await params;
  const session = await getDietSessionBySlug(slug);

  if (!session) {
    notFound();
  }

  const [questions, bills, currentDifficulty] = await Promise.all([
    getGeneralQuestionsBySessionId(session.id),
    getBillsByDietSession(session.id),
    getDifficultyLevel(),
  ]);

  return (
    <div className="bg-mirai-surface-muted">
      {/* ヘッダーバンド（この版のブランドで描画） */}
      <SessionHero label={`${session.name}の一般質問`} />

      <Container className="py-8">
        <GeneralQuestionList session={session} questions={questions} />
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
          <span className="text-black">一般質問</span>
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
