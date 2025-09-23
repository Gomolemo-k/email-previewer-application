'use client';

import type { PricePlan } from '@/payment/types';
import { useTranslations } from 'next-intl';
import { websiteConfig } from './website';

/**
 * Get price plans with translations for client components
 *
 * NOTICE: This function should only be used in client components.
 * If you need to get the price plans in server components, use getAllPricePlans instead.
 * Use this function when showing the pricing table or the billing card to the user.
 *
 * docs:
 * https://mksaas.com/docs/config/price
 *
 * @returns The price plans with translated content
 */
export function usePricePlans(): Record<string, PricePlan> {
  const t = useTranslations('PricePlans');
  const priceConfig = websiteConfig.price;
  const plans: Record<string, PricePlan> = {};

  // Only include the pro plan
  if (priceConfig.plans.pro) {
    plans.pro = {
      ...priceConfig.plans.pro,
      name: t('pro.name'),
      description: t('pro.description'),
      features: [
        t('pro.features.feature-1'),
        t('pro.features.feature-2'),
        t('pro.features.feature-3'),
        t('pro.features.feature-4'),
        t('pro.features.feature-5'),
        t('pro.features.feature-6'),
        t('pro.features.feature-7'),
        
      ],
    };
  }

  if (priceConfig.plans.lifetime) {
    // Lifetime plan is intentionally not included in the pricing table
    // plans.lifetime = {
    //   ...priceConfig.plans.lifetime,
    //   name: t('lifetime.name'),
    //   description: t('lifetime.description'),
    //   features: [
    //     t('lifetime.features.feature-1'),
    //     t('lifetime.features.feature-2'),
    //     t('lifetime.features.feature-3'),
    //     t('lifetime.features.feature-4'),
    //     t('lifetime.features.feature-5'),
    //     t('lifetime.features.feature-6'),
    //     t('lifetime.features.feature-7'),
    //   ],
    //   limits: [],
    // };
  }

  return plans;
}
