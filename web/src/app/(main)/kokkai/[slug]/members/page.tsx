import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layouts/container";
import { CouncilMemberList } from "@/features/council/client/components/council-member-list";
import { getCouncilMembersBySessionId } from "@/features/council/server/loaders/get-council-members-by-session";
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

  const members = await getCouncilMembersBySessionId(session.id);

  return (
    <div className="bg-mirai-surface-muted">
      {/* ヒーロー画像 */}
      <div className="relative w-full h-[285px]">
        <Image
          src="/img/archive-hero-7f3d06.png"
          alt={`${session.name}の議員名簿`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={85}
        />
      </div>

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
    </div>
  );
}
