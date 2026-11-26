import { EXTERNAL_LINKS } from "@/config/external-links";
import { routes } from "@/lib/routes";

export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterPolicyLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const primaryLinks: FooterLink[] = [
  {
    label: "TOP",
    href: routes.home(),
  },
  {
    label: "本家「みらい議会」",
    href: EXTERNAL_LINKS.ORIGINAL_GIKAI,
    external: true,
  },
  {
    label: "東広島市議会公式サイト",
    href: EXTERNAL_LINKS.HIGASHIHIROSHIMA_COUNCIL,
    external: true,
  },
  {
    label: "ソースコード（GitHub）",
    href: EXTERNAL_LINKS.GITHUB_REPO,
    external: true,
  },
];

export const policyLinks: FooterPolicyLink[] = [
  {
    label: "利用規約",
    href: routes.terms(),
  },
  {
    label: "プライバシーポリシー",
    href: routes.privacy(),
  },
  {
    label: "開発者向け",
    href: routes.developers(),
  },
];
