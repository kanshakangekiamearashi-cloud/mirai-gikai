import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layouts/container";
import { getBillsByDietSession } from "@/features/bills/server/loaders/get-bills-by-diet-session";
import { getCouncilMembersBySessionId } from "@/features/council/server/loaders/get-council-members-by-session";
import { getGeneralQuestionsBySessionId } from "@/features/council/server/loaders/get-general-questions-by-session";
import { DietSessionBillList } from "@/features/diet-sessions/client/components/diet-session-bill-list";
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
    title: `${session.name}の議案一覧 | みらい議会`,
    description: `${session.name}（${session.start_date}〜${session.end_date}）に提出された議案の一覧です。`,
  };
}

export default async function DietSessionBillsPage({ params }: Props) {
  const { slug } = await params;
  const session = await getDietSessionBySlug(slug);

  if (!session) {
    notFound();
  }

  const bills = await getBillsByDietSession(session.id);
  const [questions, members] = await Promise.all([
    getGeneralQuestionsBySessionId(session.id),
    getCouncilMembersBySessionId(session.id),
  ]);

  return (
    <div className="bg-mirai-surface-muted">
      {/* ヒーロー画像 */}
      <div className="relative w-full h-[285px]">
        <Image
          src="/img/archive-hero-7f3d06.png"
          alt={`${session.name}の議案一覧`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={85}
        />
      </div>

      <Container className="py-8">
        <DietSessionBillList session={session} bills={bills} />
      </Container>

      {/* 一般質問・議員名簿への導線（収録がある会期のみ） */}
      {(questions.length > 0 || members.length > 0) && (
        <Container className="pb-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            {questions.length > 0 && (
              <Link
                href={routes.kokkaiSessionQuestions(slug)}
                className="flex flex-1 items-center justify-between rounded-2xl bg-white px-5 py-4"
              >
                <span className="text-[15px] font-bold text-black">
                  一般質問（{questions.length}項目）
                </span>
                <ChevronRight className="h-5 w-5 text-black" />
              </Link>
            )}
            {members.length > 0 && (
              <Link
                href={routes.kokkaiSessionMembers(slug)}
                className="flex flex-1 items-center justify-between rounded-2xl bg-white px-5 py-4"
              >
                <span className="text-[15px] font-bold text-black">
                  議員名簿（{members.length}名）
                </span>
                <ChevronRight className="h-5 w-5 text-black" />
              </Link>
            )}
          </div>
        </Container>
      )}

      {/* パンくずリスト */}
      <Container className="py-8">
        <nav className="flex items-center gap-2 text-[15px]">
          <Link href={routes.home()} className="text-black">
            TOP
          </Link>
          <ChevronRight className="h-5 w-5 text-black" />
          <span className="text-black">過去の議案</span>
        </nav>
      </Container>
    </div>
  );
}
