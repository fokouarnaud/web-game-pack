/**
 * Types pour le système de monétisation et business
 * Task 19: Monétisation et Business - Phase 5
 */

// Types de plans d'abonnement
export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise',
  WHITE_LABEL = 'white_label'
}

// Statuts d'abonnement
export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  TRIAL = 'trial',
  SUSPENDED = 'suspended',
  PAST_DUE = 'past_due'
}

// Types de paiement
export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  BANK_TRANSFER = 'bank_transfer',
  CRYPTOCURRENCY = 'cryptocurrency'
}

// Fréquence de facturation
export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  LIFETIME = 'lifetime'
}

// Types de contenu premium
export enum PremiumContentType {
  ADVANCED_LESSONS = 'advanced_lessons',
  PERSONALIZED_TUTORING = 'personalized_tutoring',
  EXCLUSIVE_EXERCISES = 'exclusive_exercises',
  CERTIFICATION_PREP = 'certification_prep',
  LIVE_CLASSES = 'live_classes',
  PREMIUM_ANALYTICS = 'premium_analytics',
  PRIORITY_SUPPORT = 'priority_support',
  WHITE_LABEL_BRANDING = 'white_label_branding'
}

// Types d'API commerciale
export enum ApiTier {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  UNLIMITED = 'unlimited'
}

// Plan d'abonnement
export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  description: string;
  pricing: PlanPricing;
  features: PlanFeatures;
  limits: PlanLimits;
  benefits: string[];
  popular?: boolean;
  enterprise?: boolean;
  customizable?: boolean;
  trialDays?: number;
  setupFee?: number;
  cancellationPolicy: string;
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  sla?: ServiceLevelAgreement;
}

// Tarification d'un plan
export interface PlanPricing {
  monthly: MonetaryAmount;
  quarterly?: MonetaryAmount;
  yearly: MonetaryAmount;
  lifetime?: MonetaryAmount;
  currency: string;
  discounts: PricingDiscount[];
  taxes: TaxConfiguration[];
  regionSpecific?: RegionalPricing[];
}

// Montant monétaire
export interface MonetaryAmount {
  amount: number;
  currency: string;
  formatted: string;
  originalAmount?: number; // Si en promotion
}

// Remise
export interface PricingDiscount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'free_trial' | 'free_months';
  value: number;
  conditions: DiscountConditions;
  validFrom: number;
  validUntil?: number;
  maxUsage?: number;
  currentUsage: number;
  stackable: boolean;
}

// Conditions de remise
export interface DiscountConditions {
  minDuration?: BillingCycle;
  newCustomersOnly?: boolean;
  specificPlans?: SubscriptionPlan[];
  couponCode?: string;
  geographicRestrictions?: string[];
  volumeThreshold?: number;
}

// Configuration fiscale
export interface TaxConfiguration {
  region: string;
  rate: number;
  inclusive: boolean;
  vatNumber?: string;
  exemptions: string[];
}

// Tarification régionale
export interface RegionalPricing {
  region: string;
  currency: string;
  pricing: {
    monthly: number;
    yearly: number;
  };
  taxes: TaxConfiguration[];
  paymentMethods: PaymentProvider[];
}

// Fonctionnalités d'un plan
export interface PlanFeatures {
  maxUsers: number | 'unlimited';
  maxClassrooms: number | 'unlimited';
  maxSessions: number | 'unlimited';
  storageGB: number | 'unlimited';
  apiCallsPerMonth: number | 'unlimited';
  concurrentSessions: number | 'unlimited';
  
  // Fonctionnalités booléennes
  advancedAnalytics: boolean;
  customBranding: boolean;
  whiteLabel: boolean;
  prioritySupport: boolean;
  ssoIntegration: boolean;
  apiAccess: boolean;
  mobileApps: boolean;
  offlineMode: boolean;
  exportData: boolean;
  backupRestore: boolean;
  
  // Contenu premium
  premiumContent: PremiumContentType[];
  
  // Intégrations
  integrations: IntegrationAccess[];
  
  // Support et formation
  training: TrainingInclusion[];
  certification: boolean;
}

// Limites d'un plan
export interface PlanLimits {
  daily: UsageLimits;
  monthly: UsageLimits;
  yearly?: UsageLimits;
  rateLimit: RateLimitConfig;
  featureRestrictions: FeatureRestriction[];
}

// Limites d'utilisation
export interface UsageLimits {
  lessonsCreated: number;
  studentsEnrolled: number;
  sessionsHosted: number;
  dataExported: number; // MB
  apiCalls: number;
  emailNotifications: number;
}

// Configuration de limitation de débit
export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
  concurrentRequests: number;
}

// Restriction de fonctionnalité
export interface FeatureRestriction {
  feature: string;
  restriction: 'disabled' | 'limited' | 'watermarked';
  details?: string;
  upgradeRequired: SubscriptionPlan;
}

// Accord de niveau de service
export interface ServiceLevelAgreement {
  uptime: number; // Pourcentage
  responseTime: {
    email: string; // "24h", "4h", etc.
    phone?: string;
    chat?: string;
  };
  resolution: {
    critical: string;
    high: string;
    medium: string;
    low: string;
  };
  penalties: SLAPenalty[];
}

// Pénalité SLA
export interface SLAPenalty {
  threshold: number; // Pourcentage d'uptime
  compensation: 'credit' | 'refund' | 'extension';
  amount: number; // Pourcentage ou montant fixe
}

// Abonnement utilisateur
export interface UserSubscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  
  // Dates
  startDate: number;
  endDate?: number;
  trialEndDate?: number;
  nextBillingDate?: number;
  cancelledDate?: number;
  
  // Facturation
  billingCycle: BillingCycle;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  
  // Paiement
  paymentProvider: PaymentProvider;
  paymentMethodId: string;
  lastPaymentDate?: number;
  nextPaymentAmount?: MonetaryAmount;
  
  // Utilisation
  usage: SubscriptionUsage;
  
  // Métadonnées
  metadata: SubscriptionMetadata;
  
  // Historique
  history: SubscriptionEvent[];
  
  // Paramètres
  autoRenewal: boolean;
  cancelAtPeriodEnd: boolean;
  upgradeScheduled?: SubscriptionUpgrade;
  downgradePrevention?: boolean;
}

// Utilisation de l'abonnement
export interface SubscriptionUsage {
  current: UsageMetrics;
  limits: UsageLimits;
  resetDate: number;
  overage: OverageUsage;
  trends: UsageTrend[];
}

// Métriques d'utilisation
export interface UsageMetrics {
  lessonsCompleted: number;
  sessionsAttended: number;
  studentsManaged: number;
  storageUsedMB: number;
  apiCallsMade: number;
  featuresUsed: string[];
  lastActiveDate: number;
}

// Utilisation excédentaire
export interface OverageUsage {
  enabled: boolean;
  rates: OverageRate[];
  currentCharges: MonetaryAmount;
  warnings: OverageWarning[];
}

// Taux d'excédent
export interface OverageRate {
  metric: string;
  rate: MonetaryAmount;
  threshold: number;
  tierPricing?: OverageTier[];
}

// Niveau d'excédent
export interface OverageTier {
  from: number;
  to?: number;
  rate: MonetaryAmount;
}

// Avertissement d'excédent
export interface OverageWarning {
  metric: string;
  threshold: number; // Pourcentage de la limite
  notified: boolean;
  notificationDate?: number;
}

// Tendance d'utilisation
export interface UsageTrend {
  metric: string;
  period: 'daily' | 'weekly' | 'monthly';
  data: TrendDataPoint[];
  forecast?: TrendDataPoint[];
}

// Point de données de tendance
export interface TrendDataPoint {
  date: number;
  value: number;
  prediction?: boolean;
}

// Métadonnées d'abonnement
export interface SubscriptionMetadata {
  source: 'web' | 'mobile' | 'api' | 'partner';
  campaign?: string;
  referrer?: string;
  couponUsed?: string;
  salesPerson?: string;
  contractId?: string;
  customFields: Record<string, any>;
  tags: string[];
  notes: SubscriptionNote[];
}

// Note d'abonnement
export interface SubscriptionNote {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  type: 'system' | 'manual' | 'automated';
  visibility: 'internal' | 'customer';
}

// Événement d'abonnement
export interface SubscriptionEvent {
  id: string;
  type: SubscriptionEventType;
  timestamp: number;
  data: any;
  triggeredBy: string;
  automated: boolean;
}

// Types d'événements d'abonnement
export enum SubscriptionEventType {
  CREATED = 'created',
  ACTIVATED = 'activated',
  UPGRADED = 'upgraded',
  DOWNGRADED = 'downgraded',
  RENEWED = 'renewed',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended',
  REACTIVATED = 'reactivated',
  PAYMENT_SUCCEEDED = 'payment_succeeded',
  PAYMENT_FAILED = 'payment_failed',
  TRIAL_STARTED = 'trial_started',
  TRIAL_ENDED = 'trial_ended',
  USAGE_LIMIT_REACHED = 'usage_limit_reached',
  OVERAGE_CHARGED = 'overage_charged'
}

// Mise à niveau planifiée
export interface SubscriptionUpgrade {
  targetPlan: SubscriptionPlan;
  effectiveDate: number;
  prorationAmount?: MonetaryAmount;
  reason: string;
  approvedBy: string;
  scheduledDate: number;
}

// Facture
export interface Invoice {
  id: string;
  number: string;
  subscriptionId: string;
  customerId: string;
  
  // Montants
  subtotal: MonetaryAmount;
  tax: MonetaryAmount;
  total: MonetaryAmount;
  amountPaid: MonetaryAmount;
  amountDue: MonetaryAmount;
  
  // Dates
  issueDate: number;
  dueDate: number;
  paidDate?: number;
  
  // Statut
  status: InvoiceStatus;
  
  // Éléments
  lineItems: InvoiceLineItem[];
  
  // Paiement
  paymentAttempts: PaymentAttempt[];
  
  // Documents
  pdfUrl?: string;
  
  // Métadonnées
  metadata: InvoiceMetadata;
}

// Statut de facture
export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  VOID = 'void',
  UNCOLLECTIBLE = 'uncollectible'
}

// Élément de facture
export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: MonetaryAmount;
  total: MonetaryAmount;
  period?: {
    start: number;
    end: number;
  };
  metadata: Record<string, any>;
}

// Tentative de paiement
export interface PaymentAttempt {
  id: string;
  amount: MonetaryAmount;
  paymentProvider: PaymentProvider;
  paymentMethodId: string;
  status: PaymentStatus;
  timestamp: number;
  errorCode?: string;
  errorMessage?: string;
  transactionId?: string;
}

// Statut de paiement
export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed'
}

// Métadonnées de facture
export interface InvoiceMetadata {
  billingAddress: Address;
  taxAddress?: Address;
  vatNumber?: string;
  purchaseOrder?: string;
  terms?: string;
  notes?: string;
}

// Adresse
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

// API commerciale
export interface CommercialApiAccess {
  id: string;
  customerId: string;
  tier: ApiTier;
  
  // Clés d'accès
  apiKey: string;
  secretKey?: string;
  
  // Limites
  quotas: ApiQuotas;
  usage: ApiUsage;
  
  // Configuration
  permissions: ApiPermission[];
  webhooks: WebhookConfig[];
  
  // Statut
  status: 'active' | 'suspended' | 'revoked';
  
  // Dates
  createdAt: number;
  expiresAt?: number;
  lastUsedAt?: number;
}

// Quotas API
export interface ApiQuotas {
  requestsPerMinute: number;
  requestsPerDay: number;
  requestsPerMonth: number;
  concurrentRequests: number;
  dataTransferGB: number;
}

// Utilisation API
export interface ApiUsage {
  requestsToday: number;
  requestsThisMonth: number;
  dataTransferredMB: number;
  resetDate: number;
  overageCharges?: MonetaryAmount;
}

// Permission API
export interface ApiPermission {
  endpoint: string;
  methods: string[];
  rateLimit?: number;
  scope?: string[];
}

// Configuration webhook
export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  headers?: Record<string, string>;
  retryPolicy: WebhookRetryPolicy;
}

// Politique de retry webhook
export interface WebhookRetryPolicy {
  maxAttempts: number;
  backoffMultiplier: number;
  maxDelay: number;
}

// Solution White-label
export interface WhiteLabelSolution {
  id: string;
  customerId: string;
  
  // Branding
  branding: BrandingConfiguration;
  
  // Domaine
  customDomain?: string;
  sslCertificate?: SSLCertificate;
  
  // Configuration
  features: WhiteLabelFeatures;
  restrictions: WhiteLabelRestrictions;
  
  // Utilisateurs
  maxUsers: number;
  currentUsers: number;
  
  // Support
  supportConfiguration: SupportConfiguration;
  
  // Facturation
  billing: WhiteLabelBilling;
  
  // Statut
  status: 'setup' | 'active' | 'suspended';
  
  // Dates
  setupDate: number;
  goLiveDate?: number;
  lastUpdated: number;
}

// Configuration de marque
export interface BrandingConfiguration {
  companyName: string;
  logo: BrandingAsset;
  favicon?: BrandingAsset;
  colors: ColorScheme;
  fonts: FontConfiguration;
  emailTemplates: EmailTemplate[];
  footerText?: string;
  termsOfService?: string;
  privacyPolicy?: string;
}

// Asset de marque
export interface BrandingAsset {
  url: string;
  width: number;
  height: number;
  fileSize: number;
  format: string;
}

// Schéma de couleurs
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  success: string;
  warning: string;
  error: string;
}

// Configuration de police
export interface FontConfiguration {
  primary: FontDefinition;
  secondary?: FontDefinition;
  monospace?: FontDefinition;
}

// Définition de police
export interface FontDefinition {
  family: string;
  weights: number[];
  source: 'google' | 'custom' | 'system';
  url?: string;
}

// Template d'email
export interface EmailTemplate {
  type: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

// Fonctionnalités white-label
export interface WhiteLabelFeatures {
  customDomain: boolean;
  removeBranding: boolean;
  customEmailDomain: boolean;
  apiWhitelabeling: boolean;
  mobileAppBranding: boolean;
  customOnboarding: boolean;
  dedicatedSupport: boolean;
  customIntegrations: boolean;
}

// Restrictions white-label
export interface WhiteLabelRestrictions {
  maxSubdomains: number;
  maxCustomizations: number;
  allowedIntegrations: string[];
  bannedFeatures: string[];
  usageReporting: boolean;
}

// Configuration SSL
export interface SSLCertificate {
  provider: string;
  status: 'pending' | 'active' | 'expired' | 'error';
  issuedDate?: number;
  expiryDate?: number;
  autoRenewal: boolean;
}

// Configuration support
export interface SupportConfiguration {
  level: 'basic' | 'premium' | 'dedicated';
  channels: SupportChannel[];
  businessHours: BusinessHours;
  escalationRules: EscalationRule[];
  knowledgeBase: boolean;
  chatWidget: boolean;
}

// Canal de support
export interface SupportChannel {
  type: 'email' | 'phone' | 'chat' | 'ticket';
  enabled: boolean;
  responseTime: string;
  availability: 'business_hours' | '24_7' | 'limited';
}

// Heures d'ouverture
export interface BusinessHours {
  timezone: string;
  monday: TimeSlot;
  tuesday: TimeSlot;
  wednesday: TimeSlot;
  thursday: TimeSlot;
  friday: TimeSlot;
  saturday?: TimeSlot;
  sunday?: TimeSlot;
  holidays: Holiday[];
}

// Créneau horaire
export interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "17:00"
  enabled: boolean;
}

// Jour férié
export interface Holiday {
  date: number;
  name: string;
  recurring: boolean;
}

// Règle d'escalade
export interface EscalationRule {
  trigger: EscalationTrigger;
  action: EscalationAction;
  delay: number; // minutes
}

// Déclencheur d'escalade
export interface EscalationTrigger {
  type: 'time' | 'priority' | 'customer_tier' | 'no_response';
  value: any;
}

// Action d'escalade
export interface EscalationAction {
  type: 'assign_to' | 'notify' | 'priority_boost';
  target: string;
}

// Facturation white-label
export interface WhiteLabelBilling {
  model: 'flat_fee' | 'per_user' | 'revenue_share' | 'custom';
  baseFee?: MonetaryAmount;
  perUserFee?: MonetaryAmount;
  revenueSharePercent?: number;
  minimumCommitment?: MonetaryAmount;
  contractLength: number; // mois
  paymentTerms: string;
}

// Accès aux intégrations
export interface IntegrationAccess {
  integration: string;
  included: boolean;
  setupFee?: MonetaryAmount;
  monthlyFee?: MonetaryAmount;
  limitations?: string[];
}

// Inclusion de formation
export interface TrainingInclusion {
  type: 'documentation' | 'video' | 'webinar' | 'onsite' | 'consulting';
  hours?: number;
  included: boolean;
  additionalCost?: MonetaryAmount;
}

// Revenue analytics
export interface RevenueAnalytics {
  period: AnalyticsPeriod;
  metrics: RevenueMetrics;
  breakdown: RevenueBreakdown;
  forecasting: RevenueForecast;
  cohortAnalysis: CohortAnalysis;
  churnAnalysis: ChurnAnalysis;
}

// Période d'analyse
export interface AnalyticsPeriod {
  start: number;
  end: number;
  granularity: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

// Métriques de revenus
export interface RevenueMetrics {
  totalRevenue: MonetaryAmount;
  recurringRevenue: MonetaryAmount;
  newRevenue: MonetaryAmount;
  expansionRevenue: MonetaryAmount;
  churnedRevenue: MonetaryAmount;
  averageRevenuePerUser: MonetaryAmount;
  customerLifetimeValue: MonetaryAmount;
  monthlyRecurringRevenue: MonetaryAmount;
  annualRecurringRevenue: MonetaryAmount;
}

// Répartition des revenus
export interface RevenueBreakdown {
  byPlan: PlanRevenue[];
  byRegion: RegionRevenue[];
  byChannel: ChannelRevenue[];
  byPaymentMethod: PaymentMethodRevenue[];
}

// Revenus par plan
export interface PlanRevenue {
  plan: SubscriptionPlan;
  revenue: MonetaryAmount;
  subscribers: number;
  averageRevenue: MonetaryAmount;
  growth: number; // pourcentage
}

// Revenus par région
export interface RegionRevenue {
  region: string;
  revenue: MonetaryAmount;
  subscribers: number;
  conversionRate: number;
}

// Revenus par canal
export interface ChannelRevenue {
  channel: string;
  revenue: MonetaryAmount;
  subscribers: number;
  acquisitionCost: MonetaryAmount;
}

// Revenus par méthode de paiement
export interface PaymentMethodRevenue {
  method: PaymentProvider;
  revenue: MonetaryAmount;
  transactions: number;
  successRate: number;
}

// Prévision de revenus
export interface RevenueForecast {
  nextMonth: MonetaryAmount;
  nextQuarter: MonetaryAmount;
  nextYear: MonetaryAmount;
  confidence: number; // pourcentage
  assumptions: ForecastAssumption[];
}

// Hypothèse de prévision
export interface ForecastAssumption {
  parameter: string;
  value: number;
  impact: 'high' | 'medium' | 'low';
}

// Analyse de cohorte
export interface CohortAnalysis {
  cohorts: Cohort[];
  retentionRates: RetentionMatrix;
  revenueRetention: RevenueRetentionMatrix;
}

// Cohorte
export interface Cohort {
  period: string;
  size: number;
  initialRevenue: MonetaryAmount;
  currentRevenue: MonetaryAmount;
  retentionRate: number;
}

// Matrice de rétention
export interface RetentionMatrix {
  periods: string[];
  cohorts: CohortRetention[];
}

// Rétention de cohorte
export interface CohortRetention {
  cohort: string;
  retentionByPeriod: number[];
}

// Matrice de rétention des revenus
export interface RevenueRetentionMatrix {
  periods: string[];
  cohorts: CohortRevenueRetention[];
}

// Rétention des revenus de cohorte
export interface CohortRevenueRetention {
  cohort: string;
  revenueByPeriod: MonetaryAmount[];
}

// Analyse de churn
export interface ChurnAnalysis {
  churnRate: ChurnMetrics;
  churnReasons: ChurnReason[];
  predictiveFactors: PredictiveFactors;
  preventionOpportunities: PreventionOpportunity[];
}

// Métriques de churn
export interface ChurnMetrics {
  monthly: number;
  quarterly: number;
  yearly: number;
  revenue: number; // churn en termes de revenus
  voluntary: number;
  involuntary: number;
}

// Raison de churn
export interface ChurnReason {
  reason: string;
  frequency: number;
  impact: MonetaryAmount;
  preventable: boolean;
}

// Facteurs prédictifs
export interface PredictiveFactors {
  usageDecline: number;
  supportTickets: number;
  paymentIssues: number;
  featureRequests: number;
  competitorMentions: number;
}

// Opportunité de prévention
export interface PreventionOpportunity {
  segment: string;
  riskLevel: 'high' | 'medium' | 'low';
  potentialSavings: MonetaryAmount;
  recommendedActions: string[];
}

// Actions du store de monétisation
export type MonetizationAction =
  | { type: 'LOAD_SUBSCRIPTION'; payload: { userId: string } }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: UserSubscription }
  | { type: 'UPGRADE_PLAN'; payload: { planId: SubscriptionPlan; userId: string } }
  | { type: 'CANCEL_SUBSCRIPTION'; payload: { subscriptionId: string; reason: string } }
  | { type: 'PROCESS_PAYMENT'; payload: { invoiceId: string; paymentMethodId: string } }
  | { type: 'TRACK_USAGE'; payload: { userId: string; metric: string; value: number } }
  | { type: 'APPLY_DISCOUNT'; payload: { subscriptionId: string; discountId: string } }
  | { type: 'GENERATE_INVOICE'; payload: { subscriptionId: string; period: BillingCycle } };

// État du système de monétisation
export interface MonetizationState {
  currentSubscription?: UserSubscription;
  availablePlans: SubscriptionPlanDetails[];
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
  usage: SubscriptionUsage;
  discounts: PricingDiscount[];
  apiAccess?: CommercialApiAccess;
  whiteLabelConfig?: WhiteLabelSolution;
  analytics: RevenueAnalytics;
  loading: boolean;
  errors: MonetizationError[];
}

// Méthode de paiement
export interface PaymentMethod {
  id: string;
  type: PaymentProvider;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  isDefault: boolean;
  billingAddress: Address;
  status: 'active' | 'expired' | 'requires_verification';
}

// Erreur de monétisation
export interface MonetizationError {
  id: string;
  type: 'payment' | 'subscription' | 'usage' | 'api' | 'billing';
  message: string;
  details?: any;
  timestamp: number;
  resolved: boolean;
}

// Constantes
export const PLAN_CONFIGS: Record<SubscriptionPlan, SubscriptionPlanDetails> = {
  [SubscriptionPlan.FREE]: {
    id: SubscriptionPlan.FREE,
    name: 'Gratuit',
    description: 'Parfait pour découvrir Dialect Game',
    pricing: {
      monthly: { amount: 0, currency: 'EUR', formatted: 'Gratuit' },
      yearly: { amount: 0, currency: 'EUR', formatted: 'Gratuit' },
      currency: 'EUR',
      discounts: [],
      taxes: []
    },
    features: {
      maxUsers: 1,
      maxClassrooms: 2,
      maxSessions: 5,
      storageGB: 1,
      apiCallsPerMonth: 1000,
      concurrentSessions: 1,
      advancedAnalytics: false,
      customBranding: false,
      whiteLabel: false,
      prioritySupport: false,
      ssoIntegration: false,
      apiAccess: false,
      mobileApps: true,
      offlineMode: false,
      exportData: false,
      backupRestore: false,
      premiumContent: [],
      integrations: [],
      training: [],
      certification: false
    },
    limits: {
      daily: {
        lessonsCreated: 3,
        studentsEnrolled: 5,
        sessionsHosted: 1,
        dataExported: 0,
        apiCalls: 100,
        emailNotifications: 10
      },
      monthly: {
        lessonsCreated: 50,
        studentsEnrolled: 25,
        sessionsHosted: 5,
        dataExported: 0,
        apiCalls: 1000,
        emailNotifications: 100
      },
      rateLimit: {
        requestsPerMinute: 10,
        requestsPerHour: 100,
        requestsPerDay: 1000,
        burstLimit: 20,
        concurrentRequests: 2
      },
      featureRestrictions: [
        {
          feature: 'analytics',
          restriction: 'limited',
          details: 'Données limitées à 7 jours',
          upgradeRequired: SubscriptionPlan.BASIC
        }
      ]
    },
    benefits: [
      'Accès aux leçons de base',
      'Mode collaboratif limité',
      'Support communautaire',
      'Interface mobile'
    ],
    cancellationPolicy: 'Annulation immédiate',
    supportLevel: 'community'
  },
  
  // Les autres plans seraient définis similairement...
  [SubscriptionPlan.BASIC]: {} as SubscriptionPlanDetails,
  [SubscriptionPlan.PREMIUM]: {} as SubscriptionPlanDetails,
  [SubscriptionPlan.BUSINESS]: {} as SubscriptionPlanDetails,
  [SubscriptionPlan.ENTERPRISE]: {} as SubscriptionPlanDetails,
  [SubscriptionPlan.WHITE_LABEL]: {} as SubscriptionPlanDetails,
};