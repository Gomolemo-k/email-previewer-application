import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Routes } from '@/routes';

export function SubscriberBlocker() {
  const t = useTranslations('Dashboard.email-preview');

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex flex-col items-center justify-center h-full">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>{t('subscription-required.title')}</CardTitle>
            <CardDescription>{t('subscription-required.description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-center text-muted-foreground">{t('subscription-required.message')}</p>
            <div className="flex flex-col gap-2 w-full">
              <Button asChild className="w-full">
                <Link href={Routes.Payment}>{t('subscription-required.upgradeNow')}</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href={Routes.Dashboard}>{t('subscription-required.backToDashboard')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}