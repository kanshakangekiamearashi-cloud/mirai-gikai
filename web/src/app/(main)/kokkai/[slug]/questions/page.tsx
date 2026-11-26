import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layouts/container";
import { GeneralQuestionList } from "@/features/council/client/components/general-question-list";
import { getGeneralQuestionsBySessionId } from "@/features/council/server/loaders/get-general-questions-by-session";
import { getDietSessionBySlug } from "@/features/diet-sessions/server/loaders/get-diet-session-by-slug";
import { routes } from "@/lib/routes";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const session = await getDietSessionBySlug(slug);

  if (!session) {
    return { title: "国会会期が見つかりません" };
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

  const questions = await getGeneralQuestionsBySessionId(session.id);

  return (
    <div className="bg-mirai-surface-muted">
      {/* ヒーロー画像 */}
      <div className="relative w-full h-[285px]">
        <Image
          src="/img/archive-hero-7f3d06.png"
          alt={`${session.name}の一般質問`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={85}
        />
      </div>

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
    </div>
  );
}
