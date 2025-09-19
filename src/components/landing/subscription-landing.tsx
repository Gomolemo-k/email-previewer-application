'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { websiteConfig } from '@/config/website';
import { LocaleLink } from '@/i18n/navigation';
import { Routes } from '@/routes';
import { SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function SubscriptionLanding() {
  const t = useTranslations('Dashboard.landing');
  
  // Get the pro plan from the website config
  const proPlan = websiteConfig.price.plans.pro;
  const monthlyPrice = proPlan.prices.find(price => price.interval === 'month');
  const yearlyPrice = proPlan.prices.find(price => price.interval === 'year');
  
  // Calculate yearly savings
  const monthlyAmount = monthlyPrice ? monthlyPrice.amount / 100 : 0;
  const yearlyAmount = yearlyPrice ? yearlyPrice.amount / 100 : 0;
  const yearlySavings = monthlyAmount * 12 - yearlyAmount;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-none border-0">
          <CardHeader className="text-center gap-4">
            <div className="mx-auto bg-primary/10 p-3 rounded-full">
              <SparklesIcon className="size-8 text-primary" />
            </div>
            <CardTitle className="text-2xl md:text-3xl">
              {t('welcomeTitle')}
            </CardTitle>
            <CardDescription className="text-base">
              {t('welcomeDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted rounded-lg p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{proPlan.name}</h3>
                <ul className="space-y-2">
                  {proPlan.features?.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {monthlyPrice && (
                      <div className="flex-1 text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">
                          ${monthlyAmount.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t('perMonth')}
                        </div>
                      </div>
                    )}
                    {yearlyPrice && (
                      <div className="flex-1 text-center p-3 border rounded-lg bg-primary/5 relative">
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          {t('save')} ${yearlySavings.toFixed(2)}
                        </div>
                        <div className="text-2xl font-bold">
                          ${yearlyAmount.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t('perYear')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1" size="lg" asChild>
                <LocaleLink href={Routes.SettingsBilling}>
                  {t('getStarted')}
                </LocaleLink>
              </Button>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              {t('existingUser')}{' '}
              <LocaleLink 
                href={Routes.Login} 
                className="text-primary hover:underline"
              >
                {t('signIn')}
              </LocaleLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}