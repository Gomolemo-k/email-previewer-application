import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { websiteConfig } from '@/config/website';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import { MailIcon, TwitterIcon } from 'lucide-react';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const pt = await getTranslations({ locale, namespace: 'VideoPage' });

  return constructMetadata({
    title: pt('title') + ' | ' + t('title'),
    description: pt('description'),
    canonicalUrl: getUrlWithLocale('/ai/video', locale),
  });
}

export default async function VideoPage() {
  const t = await getTranslations('VideoPage');

  return (
    <div className="relative flex min-h-screen w-full overflow-x-clip">
      {/* background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>

      <div className="container relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-12 px-4 py-16 text-center">
        {/* logo */}
        <img
          src="/e-p.png"
          alt="logo"
          width={128}
          height={128}
          className="size-24 rounded-lg"
        />

        {/* header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground md:text-5xl">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            {t('description')}
          </p>
        </div>

        {/* cta */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button className="rounded-lg">
            <a href={websiteConfig.metadata.social?.twitter}>
              <TwitterIcon className="mr-1 size-4" /> {t('getStarted')}
            </a>
          </Button>
          <Button variant="outline" className="rounded-lg">
            <a href={`mailto:${websiteConfig.mail.supportEmail}`}>
              <MailIcon className="mr-1 size-4" /> {t('contactUs')}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
