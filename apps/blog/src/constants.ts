import type { Props } from "astro";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

export const SOCIALS: Social[] = [] as const;

export const SHARE_LINKS: Social[] = [] as const;
