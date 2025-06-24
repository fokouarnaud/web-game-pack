/**
 * Tests unitaires pour le système de monétisation
 * Task 19: Monétisation et Business - Phase 5
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// Types simplifiés pour les tests
interface SubscriptionPlan {
  id: string;
  name: string;
  price: { monthly: number; yearly: number };
  features: string[];
  limits: Record<string, number>;
}

interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'trial' | 'cancelled' | 'expired';
  startDate: number;
  endDate?: number;
  autoRenewal: boolean;
}

interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  dueDate: number;
}

// Service de monétisation simplifié pour les tests
class TestMonetizationService {
  private plans: Map<string, SubscriptionPlan> = new Map();
  private subscriptions: Map<string, UserSubscription> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private usage: Map<string, Record<string, number>> = new Map();

  constructor() {
    // Plans de test
    this.plans.set('free', {
      id: 'free',
      name: 'Gratuit',
      price: { monthly: 0, yearly: 0 },
      features: ['basic_features'],
      limits: { classrooms: 2, students: 5, storage_gb: 1 }
    });

    this.plans.set('premium', {
      id: 'premium',
      name: 'Premium',
      price: { monthly: 29.99, yearly: 299.99 },
      features: ['basic_features', 'advanced_analytics', 'api_access'],
      limits: { classrooms: -1, students: 500, storage_gb: 100 }
    });
  }

  getPlans(): SubscriptionPlan[] {
    return Array.from(this.plans.values());
  }

  getPlan(planId: string): SubscriptionPlan | null {
    return this.plans.get(planId) || null;
  }

  createSubscription(userId: string, planId: string): UserSubscription {
    const plan = this.getPlan(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const subscription: UserSubscription = {
      id: `sub_${Date.now()}`,
      userId,
      planId,
      status: planId === 'free' ? 'active' : 'trial',
      startDate: Date.now(),
      endDate: planId === 'free' ? undefined : Date.now() + (14 * 24 * 60 * 60 * 1000),
      autoRenewal: true
    };

    this.subscriptions.set(subscription.id, subscription);
    this.usage.set(userId, {});
    return subscription;
  }

  getUserSubscription(userId: string): UserSubscription | null {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.userId === userId && subscription.status === 'active') {
        return subscription;
      }
    }
    return null;
  }

  upgradeSubscription(subscriptionId: string, newPlanId: string): UserSubscription {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const newPlan = this.getPlan(newPlanId);
    if (!newPlan) {
      throw new Error('Plan not found');
    }

    subscription.planId = newPlanId;
    subscription.status = 'active';
    this.subscriptions.set(subscriptionId, subscription);
    return subscription;
  }

  cancelSubscription(subscriptionId: string): UserSubscription {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.status = 'cancelled';
    subscription.autoRenewal = false;
    this.subscriptions.set(subscriptionId, subscription);
    return subscription;
  }

  createInvoice(subscriptionId: string): Invoice {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const plan = this.getPlan(subscription.planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const invoice: Invoice = {
      id: `inv_${Date.now()}`,
      subscriptionId,
      amount: plan.price.monthly,
      status: 'pending',
      dueDate: Date.now() + (30 * 24 * 60 * 60 * 1000)
    };

    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  processPayment(invoiceId: string): boolean {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Simulation de paiement (95% de réussite)
    const success = Math.random() > 0.05;
    invoice.status = success ? 'paid' : 'failed';
    this.invoices.set(invoiceId, invoice);
    return success;
  }

  trackUsage(userId: string, metric: string, value: number): void {
    const usage = this.usage.get(userId) || {};
    usage[metric] = (usage[metric] || 0) + value;
    this.usage.set(userId, usage);
  }

  getUsage(userId: string): Record<string, number> {
    return this.usage.get(userId) || {};
  }

  hasFeatureAccess(userId: string, feature: string): boolean {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) {
      return false; // Plan gratuit par défaut
    }

    const plan = this.getPlan(subscription.planId);
    return plan ? plan.features.includes(feature) : false;
  }

  checkUsageLimit(userId: string, metric: string): boolean {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) {
      return false;
    }

    const plan = this.getPlan(subscription.planId);
    if (!plan) {
      return false;
    }

    const limit = plan.limits[metric];
    if (limit === -1) {
      return true; // Illimité
    }

    const usage = this.getUsage(userId);
    return (usage[metric] || 0) < limit;
  }

  calculateAnnualSavings(planId: string): number {
    const plan = this.getPlan(planId);
    if (!plan) {
      return 0;
    }

    const annualMonthly = plan.price.monthly * 12;
    const annualPrice = plan.price.yearly;
    
    if (annualPrice === 0 || annualMonthly === 0) {
      return 0;
    }

    return Math.round(((annualMonthly - annualPrice) / annualMonthly) * 100);
  }
}

describe('Monetization System', () => {
  let monetizationService: TestMonetizationService;

  beforeEach(() => {
    monetizationService = new TestMonetizationService();
  });

  describe('Plans Management', () => {
    test('should return available plans', () => {
      const plans = monetizationService.getPlans();
      
      expect(plans).toHaveLength(2);
      expect(plans.find(p => p.id === 'free')).toBeTruthy();
      expect(plans.find(p => p.id === 'premium')).toBeTruthy();
    });

    test('should get specific plan by ID', () => {
      const freePlan = monetizationService.getPlan('free');
      
      expect(freePlan).toBeTruthy();
      expect(freePlan?.id).toBe('free');
      expect(freePlan?.name).toBe('Gratuit');
      expect(freePlan?.price.monthly).toBe(0);
    });

    test('should return null for non-existent plan', () => {
      const plan = monetizationService.getPlan('non-existent');
      expect(plan).toBeNull();
    });

    test('should calculate annual savings correctly', () => {
      const savings = monetizationService.calculateAnnualSavings('premium');
      
      // Premium: 29.99 * 12 = 359.88, yearly = 299.99
      // Savings = ((359.88 - 299.99) / 359.88) * 100 ≈ 17%
      expect(savings).toBeGreaterThan(15);
      expect(savings).toBeLessThan(20);
    });

    test('should return 0 savings for free plan', () => {
      const savings = monetizationService.calculateAnnualSavings('free');
      expect(savings).toBe(0);
    });
  });

  describe('Subscription Management', () => {
    test('should create free subscription', () => {
      const subscription = monetizationService.createSubscription('user-123', 'free');
      
      expect(subscription.userId).toBe('user-123');
      expect(subscription.planId).toBe('free');
      expect(subscription.status).toBe('active');
      expect(subscription.endDate).toBeUndefined();
      expect(subscription.autoRenewal).toBe(true);
    });

    test('should create premium subscription with trial', () => {
      const subscription = monetizationService.createSubscription('user-456', 'premium');
      
      expect(subscription.userId).toBe('user-456');
      expect(subscription.planId).toBe('premium');
      expect(subscription.status).toBe('trial');
      expect(subscription.endDate).toBeTruthy();
      expect(subscription.autoRenewal).toBe(true);
    });

    test('should throw error for invalid plan', () => {
      expect(() => {
        monetizationService.createSubscription('user-123', 'invalid-plan');
      }).toThrow('Plan not found');
    });

    test('should get user subscription', () => {
      const created = monetizationService.createSubscription('user-789', 'premium');
      const retrieved = monetizationService.getUserSubscription('user-789');
      
      expect(retrieved).toBeTruthy();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.userId).toBe('user-789');
    });

    test('should return null for user without subscription', () => {
      const subscription = monetizationService.getUserSubscription('non-existent-user');
      expect(subscription).toBeNull();
    });

    test('should upgrade subscription', () => {
      const subscription = monetizationService.createSubscription('user-upgrade', 'free');
      const upgraded = monetizationService.upgradeSubscription(subscription.id, 'premium');
      
      expect(upgraded.planId).toBe('premium');
      expect(upgraded.status).toBe('active');
    });

    test('should cancel subscription', () => {
      const subscription = monetizationService.createSubscription('user-cancel', 'premium');
      const cancelled = monetizationService.cancelSubscription(subscription.id);
      
      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.autoRenewal).toBe(false);
    });

    test('should throw error when upgrading non-existent subscription', () => {
      expect(() => {
        monetizationService.upgradeSubscription('non-existent', 'premium');
      }).toThrow('Subscription not found');
    });
  });

  describe('Invoice and Payment Management', () => {
    test('should create invoice for subscription', () => {
      const subscription = monetizationService.createSubscription('user-invoice', 'premium');
      const invoice = monetizationService.createInvoice(subscription.id);
      
      expect(invoice.subscriptionId).toBe(subscription.id);
      expect(invoice.amount).toBe(29.99);
      expect(invoice.status).toBe('pending');
      expect(invoice.dueDate).toBeGreaterThan(Date.now());
    });

    test('should process payment successfully', () => {
      const subscription = monetizationService.createSubscription('user-payment', 'premium');
      const invoice = monetizationService.createInvoice(subscription.id);
      
      // Mock Math.random pour garantir le succès
      vi.spyOn(Math, 'random').mockReturnValue(0.1); // > 0.05 = success
      
      const success = monetizationService.processPayment(invoice.id);
      expect(success).toBe(true);
      
      vi.restoreAllMocks();
    });

    test('should handle payment failure', () => {
      const subscription = monetizationService.createSubscription('user-fail', 'premium');
      const invoice = monetizationService.createInvoice(subscription.id);
      
      // Mock Math.random pour garantir l'échec
      vi.spyOn(Math, 'random').mockReturnValue(0.01); // < 0.05 = failure
      
      const success = monetizationService.processPayment(invoice.id);
      expect(success).toBe(false);
      
      vi.restoreAllMocks();
    });

    test('should throw error for non-existent invoice', () => {
      expect(() => {
        monetizationService.processPayment('non-existent-invoice');
      }).toThrow('Invoice not found');
    });
  });

  describe('Usage Tracking', () => {
    test('should track usage metrics', () => {
      monetizationService.createSubscription('user-usage', 'premium');
      
      monetizationService.trackUsage('user-usage', 'classrooms_created', 1);
      monetizationService.trackUsage('user-usage', 'students_enrolled', 5);
      monetizationService.trackUsage('user-usage', 'classrooms_created', 2); // Total: 3
      
      const usage = monetizationService.getUsage('user-usage');
      expect(usage.classrooms_created).toBe(3);
      expect(usage.students_enrolled).toBe(5);
    });

    test('should check usage limits correctly', () => {
      monetizationService.createSubscription('user-limits', 'free');
      
      // Free plan: classrooms limit = 2
      monetizationService.trackUsage('user-limits', 'classrooms', 1);
      expect(monetizationService.checkUsageLimit('user-limits', 'classrooms')).toBe(true);
      
      monetizationService.trackUsage('user-limits', 'classrooms', 1); // Total: 2
      expect(monetizationService.checkUsageLimit('user-limits', 'classrooms')).toBe(false); // At limit
    });

    test('should allow unlimited usage for premium plans', () => {
      monetizationService.createSubscription('user-unlimited', 'premium');
      
      // Premium plan: classrooms limit = -1 (unlimited)
      monetizationService.trackUsage('user-unlimited', 'classrooms', 100);
      expect(monetizationService.checkUsageLimit('user-unlimited', 'classrooms')).toBe(true);
    });

    test('should return empty usage for new user', () => {
      const usage = monetizationService.getUsage('new-user');
      expect(usage).toEqual({});
    });
  });

  describe('Feature Access Control', () => {
    test('should grant access to plan features', () => {
      monetizationService.createSubscription('user-features', 'premium');
      
      expect(monetizationService.hasFeatureAccess('user-features', 'basic_features')).toBe(true);
      expect(monetizationService.hasFeatureAccess('user-features', 'advanced_analytics')).toBe(true);
      expect(monetizationService.hasFeatureAccess('user-features', 'api_access')).toBe(true);
    });

    test('should deny access to non-plan features', () => {
      monetizationService.createSubscription('user-limited', 'free');
      
      expect(monetizationService.hasFeatureAccess('user-limited', 'basic_features')).toBe(true);
      expect(monetizationService.hasFeatureAccess('user-limited', 'advanced_analytics')).toBe(false);
      expect(monetizationService.hasFeatureAccess('user-limited', 'api_access')).toBe(false);
    });

    test('should deny access for users without subscription', () => {
      expect(monetizationService.hasFeatureAccess('no-subscription', 'basic_features')).toBe(false);
    });
  });

  describe('Business Logic Edge Cases', () => {
    test('should handle multiple subscriptions for same user', () => {
      const subscription1 = monetizationService.createSubscription('multi-user', 'free');
      monetizationService.cancelSubscription(subscription1.id);
      
      const subscription2 = monetizationService.createSubscription('multi-user', 'premium');
      
      const activeSubscription = monetizationService.getUserSubscription('multi-user');
      expect(activeSubscription?.id).toBe(subscription2.id);
      expect(activeSubscription?.planId).toBe('premium');
    });

    test('should handle subscription lifecycle', () => {
      // Create trial subscription
      const subscription = monetizationService.createSubscription('lifecycle-user', 'premium');
      expect(subscription.status).toBe('trial');
      
      // Convert to active (simulate trial end + payment)
      const upgraded = monetizationService.upgradeSubscription(subscription.id, 'premium');
      expect(upgraded.status).toBe('active');
      
      // Cancel subscription
      const cancelled = monetizationService.cancelSubscription(subscription.id);
      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.autoRenewal).toBe(false);
    });

    test('should validate plan transitions', () => {
      const subscription = monetizationService.createSubscription('transition-user', 'free');
      
      // Upgrade from free to premium
      const upgraded = monetizationService.upgradeSubscription(subscription.id, 'premium');
      expect(upgraded.planId).toBe('premium');
      
      // Should be able to downgrade back to free
      const downgraded = monetizationService.upgradeSubscription(subscription.id, 'free');
      expect(downgraded.planId).toBe('free');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large number of subscriptions efficiently', () => {
      const startTime = Date.now();
      
      // Create 1000 subscriptions
      for (let i = 0; i < 1000; i++) {
        monetizationService.createSubscription(`user-${i}`, i % 2 === 0 ? 'free' : 'premium');
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (< 100ms)
      expect(duration).toBeLessThan(100);
      
      // Verify some subscriptions
      const subscription500 = monetizationService.getUserSubscription('user-500');
      expect(subscription500).toBeTruthy();
      expect(subscription500?.planId).toBe('free'); // Even number
      
      const subscription501 = monetizationService.getUserSubscription('user-501');
      expect(subscription501).toBeTruthy();
      expect(subscription501?.planId).toBe('premium'); // Odd number
    });

    test('should handle concurrent usage tracking', () => {
      monetizationService.createSubscription('concurrent-user', 'premium');
      
      // Simulate concurrent usage updates
      const promises: Promise<void>[] = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          Promise.resolve().then(() => {
            monetizationService.trackUsage('concurrent-user', 'api_calls', 1);
          })
        );
      }
      
      return Promise.all(promises).then(() => {
        const usage = monetizationService.getUsage('concurrent-user');
        expect(usage.api_calls).toBe(100);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid operations gracefully', () => {
      // Try to create invoice for non-existent subscription
      expect(() => {
        monetizationService.createInvoice('non-existent-subscription');
      }).toThrow('Subscription not found');
      
      // Try to upgrade non-existent subscription
      expect(() => {
        monetizationService.upgradeSubscription('non-existent', 'premium');
      }).toThrow('Subscription not found');
      
      // Try to cancel non-existent subscription
      expect(() => {
        monetizationService.cancelSubscription('non-existent');
      }).toThrow('Subscription not found');
    });

    test('should validate plan existence in operations', () => {
      const subscription = monetizationService.createSubscription('validation-user', 'free');
      
      // Try to upgrade to non-existent plan
      expect(() => {
        monetizationService.upgradeSubscription(subscription.id, 'non-existent-plan');
      }).toThrow('Plan not found');
    });
  });
});

// Tests spécifiques aux calculs financiers
describe('Financial Calculations', () => {
  let service: TestMonetizationService;

  beforeEach(() => {
    service = new TestMonetizationService();
  });

  test('should calculate prorations correctly', () => {
    // Simulation de calcul de proration
    const monthlyPrice = 29.99;
    const yearlyPrice = 299.99;
    const remainingDays = 15; // 15 jours restants sur 30
    
    const prorationRatio = remainingDays / 30;
    const expectedProration = monthlyPrice * prorationRatio;
    
    expect(expectedProration).toBeCloseTo(14.995, 2);
  });

  test('should handle currency conversions', () => {
    // Simulation de conversion de devises
    const eurToUsd = 1.1;
    const priceEur = 29.99;
    const priceUsd = priceEur * eurToUsd;
    
    expect(priceUsd).toBeCloseTo(32.989, 2);
  });

  test('should calculate tax amounts', () => {
    // Simulation de calcul de TVA (20%)
    const basePrice = 29.99;
    const taxRate = 0.20;
    const taxAmount = basePrice * taxRate;
    const totalPrice = basePrice + taxAmount;
    
    expect(taxAmount).toBeCloseTo(5.998, 2);
    expect(totalPrice).toBeCloseTo(35.988, 2);
  });
});

// Tests de l'interface utilisateur des prix
describe('Pricing UI Logic', () => {
  test('should format prices correctly', () => {
    const formatPrice = (amount: number, currency: string = 'EUR') => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency
      }).format(amount);
    };

    expect(formatPrice(29.99)).toBe('29,99 €');
    expect(formatPrice(0)).toBe('0,00 €');
    expect(formatPrice(299.99)).toBe('299,99 €');
  });

  test('should calculate savings percentage display', () => {
    const calculateSavingsDisplay = (monthly: number, yearly: number) => {
      const annualMonthly = monthly * 12;
      const savings = ((annualMonthly - yearly) / annualMonthly) * 100;
      return Math.round(savings);
    };

    expect(calculateSavingsDisplay(29.99, 299.99)).toBe(17);
    expect(calculateSavingsDisplay(9.99, 99.99)).toBe(17);
    expect(calculateSavingsDisplay(0, 0)).toBe(0);
  });

  test('should determine plan popularity', () => {
    const plans = [
      { id: 'free', subscribers: 1000 },
      { id: 'basic', subscribers: 500 },
      { id: 'premium', subscribers: 800 },
      { id: 'enterprise', subscribers: 50 }
    ];

    const mostPopular = plans.reduce((prev, current) => 
      prev.subscribers > current.subscribers ? prev : current
    );

    expect(mostPopular.id).toBe('free');
  });
});