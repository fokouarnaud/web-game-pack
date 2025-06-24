/**
 * Dashboard de tarification et monétisation
 * Task 19: Monétisation et Business - Phase 5
 */

import React, { useState, useEffect } from 'react';
import { EnhancedCard, EnhancedCardHeader, EnhancedCardContent, EnhancedCardTitle, EnhancedCardDescription } from './ui/enhanced-card';
import { EnhancedButton } from './ui/enhanced-button';
import { createToastHelpers, useToast } from './ui/toast';

interface PricingDashboardProps {
  className?: string;
}

// Plans de tarification simplifiés pour l'interface
const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    description: 'Parfait pour découvrir Dialect Game',
    price: { monthly: 0, yearly: 0 },
    popular: false,
    features: [
      '2 salles de classe maximum',
      '5 sessions par mois',
      '1 GB de stockage',
      'Support communautaire',
      'Interface mobile'
    ],
    limits: [
      '3 leçons par jour',
      '5 étudiants maximum',
      'Analytics basiques'
    ],
    cta: 'Commencer gratuitement'
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'Idéal pour les enseignants individuels',
    price: { monthly: 9.99, yearly: 99.99 },
    popular: false,
    features: [
      '10 salles de classe',
      'Sessions illimitées',
      '10 GB de stockage',
      'Support par email',
      'Analytics avancées',
      'Export de données'
    ],
    limits: [
      '50 étudiants maximum',
      'Branding Dialect Game'
    ],
    cta: 'Commencer l\'essai gratuit',
    trial: 14
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Pour les écoles et institutions',
    price: { monthly: 29.99, yearly: 299.99 },
    popular: true,
    features: [
      'Salles de classe illimitées',
      'Sessions temps réel avancées',
      '100 GB de stockage',
      'Support prioritaire',
      'Analytics enterprise',
      'API commerciale',
      'Intégrations LMS',
      'Contenu premium exclusif'
    ],
    limits: [
      '500 étudiants maximum',
      'Personnalisation limitée'
    ],
    cta: 'Commencer l\'essai gratuit',
    trial: 30
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Pour les grandes organisations',
    price: { monthly: 99.99, yearly: 999.99 },
    popular: false,
    features: [
      'Tout du Premium',
      'Étudiants illimitées',
      'Stockage illimité',
      'Support dédié',
      'SSO et sécurité avancée',
      'API enterprise',
      'Formation personnalisée',
      'SLA 99.9%'
    ],
    limits: [],
    cta: 'Contacter les ventes'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Solution sur mesure',
    price: { monthly: 'Custom', yearly: 'Custom' },
    popular: false,
    features: [
      'Tout du Business',
      'Déploiement on-premise',
      'Personnalisation complète',
      'Support 24/7',
      'Formation sur site',
      'Intégrations custom',
      'Conformité RGPD/SOC2'
    ],
    limits: [],
    cta: 'Contacter les ventes',
    enterprise: true
  }
];

// Features détaillées
const FEATURE_COMPARISON = [
  {
    category: 'Enseignement',
    features: [
      { name: 'Salles de classe', free: '2', basic: '10', premium: 'Illimité', business: 'Illimité', enterprise: 'Illimité' },
      { name: 'Sessions simultanées', free: '1', basic: '5', premium: '20', business: 'Illimité', enterprise: 'Illimité' },
      { name: 'Étudiants par classe', free: '5', basic: '25', premium: '100', business: 'Illimité', enterprise: 'Illimité' },
      { name: 'Contenu premium', free: '✗', basic: 'Limité', premium: '✓', business: '✓', enterprise: '✓' }
    ]
  },
  {
    category: 'Collaboration',
    features: [
      { name: 'Chat temps réel', free: '✓', basic: '✓', premium: '✓', business: '✓', enterprise: '✓' },
      { name: 'Tableau blanc collaboratif', free: 'Basique', basic: '✓', premium: 'Avancé', business: 'Avancé', enterprise: 'Avancé' },
      { name: 'Partage d\'écran', free: '✗', basic: '✓', premium: '✓', business: '✓', enterprise: '✓' },
      { name: 'Enregistrement sessions', free: '✗', basic: '✗', premium: '✓', business: '✓', enterprise: '✓' }
    ]
  },
  {
    category: 'Analytics & Reporting',
    features: [
      { name: 'Analytics basiques', free: '✓', basic: '✓', premium: '✓', business: '✓', enterprise: '✓' },
      { name: 'Analytics avancées', free: '✗', basic: '✓', premium: '✓', business: '✓', enterprise: '✓' },
      { name: 'Rapports personnalisés', free: '✗', basic: '✗', premium: '✓', business: '✓', enterprise: '✓' },
      { name: 'Export données', free: '✗', basic: 'CSV', premium: 'CSV/Excel', business: 'Tous formats', enterprise: 'API' }
    ]
  },
  {
    category: 'Support & Services',
    features: [
      { name: 'Support', free: 'Communauté', basic: 'Email', premium: 'Prioritaire', business: 'Dédié', enterprise: '24/7' },
      { name: 'Formation', free: 'Docs', basic: 'Webinaires', premium: 'Formation', business: 'Personnalisée', enterprise: 'Sur site' },
      { name: 'SLA', free: 'Aucun', basic: 'Aucun', premium: '99%', business: '99.9%', enterprise: '99.99%' }
    ]
  }
];

export const PricingDashboard: React.FC<PricingDashboardProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const toastHelpers = createToastHelpers(toast);
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentView, setCurrentView] = useState<'plans' | 'comparison' | 'api' | 'enterprise'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Calculer les économies annuelles
  const calculateSavings = (monthly: number | string, yearly: number | string) => {
    if (typeof monthly !== 'number' || typeof yearly !== 'number') return 0;
    const annualMonthly = monthly * 12;
    return Math.round(((annualMonthly - yearly) / annualMonthly) * 100);
  };

  // Gérer la sélection d'un plan
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    const plan = PRICING_PLANS.find(p => p.id === planId);
    
    if (plan?.enterprise) {
      toastHelpers.info('Contact commercial', 'Notre équipe vous contactera sous 24h pour une démonstration personnalisée');
    } else if (plan?.trial) {
      toastHelpers.success('Essai gratuit', `Essai gratuit de ${plan.trial} jours activé pour le plan ${plan.name}`);
    } else {
      toastHelpers.success('Plan sélectionné', `Vous avez sélectionné le plan ${plan?.name}`);
    }
  };

  // Gérer la demande de démo
  const handleRequestDemo = () => {
    toastHelpers.info('Demande envoyée', 'Notre équipe vous contactera sous 24h pour planifier votre démonstration');
  };

  // Vue des plans de tarification
  const renderPricingPlans = () => (
    <div className="space-y-8">
      {/* Header avec toggle billing */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Tarification Transparente
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choisissez le plan qui correspond à vos besoins. Commencez gratuitement et évoluez au fur et à mesure de votre croissance.
        </p>
        
        {/* Toggle mensuel/annuel */}
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
            Mensuel
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
            Annuel
          </span>
          {billingCycle === 'yearly' && (
            <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
              Jusqu'à 20% d'économie
            </span>
          )}
        </div>
      </div>

      {/* Grille des plans */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {PRICING_PLANS.map((plan) => {
          const price = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
          const savings = calculateSavings(plan.price.monthly, plan.price.yearly);
          
          return (
            <EnhancedCard
              key={plan.id}
              variant={plan.popular ? "default" : "elevated"}
              className={`relative transform transition-all duration-200 hover:scale-105 ${
                selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
              } ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Le plus populaire
                  </span>
                </div>
              )}
              
              <EnhancedCardHeader className="text-center">
                <EnhancedCardTitle className="text-xl">{plan.name}</EnhancedCardTitle>
                <EnhancedCardDescription className="text-sm">
                  {plan.description}
                </EnhancedCardDescription>
                
                <div className="mt-4">
                  <div className="text-3xl font-bold">
                    {typeof price === 'number' ? (
                      <>
                        {price === 0 ? 'Gratuit' : `${price}€`}
                        {price > 0 && (
                          <span className="text-lg font-normal text-gray-500">
                            /{billingCycle === 'monthly' ? 'mois' : 'an'}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-2xl">Sur devis</span>
                    )}
                  </div>
                  
                  {billingCycle === 'yearly' && savings > 0 && typeof price === 'number' && price > 0 && (
                    <div className="text-sm text-green-600 mt-1">
                      Économisez {savings}%
                    </div>
                  )}
                </div>
              </EnhancedCardHeader>
              
              <EnhancedCardContent className="space-y-4">
                {/* Fonctionnalités incluses */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Inclus:</h4>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Limites */}
                {plan.limits.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Limites:</h4>
                    <ul className="space-y-1">
                      {plan.limits.map((limit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-orange-500 mt-0.5">!</span>
                          <span>{limit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* CTA Button */}
                <EnhancedButton 
                  onClick={() => handlePlanSelect(plan.id)}
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full mt-4"
                >
                  {plan.cta}
                </EnhancedButton>
                
                {plan.trial && (
                  <p className="text-xs text-center text-gray-500">
                    Essai gratuit de {plan.trial} jours, sans engagement
                  </p>
                )}
              </EnhancedCardContent>
            </EnhancedCard>
          );
        })}
      </div>

      {/* Section entreprise */}
      <div className="mt-12 text-center">
        <EnhancedCard variant="elevated" className="max-w-4xl mx-auto">
          <EnhancedCardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4">Solutions Enterprise</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Besoin d'une solution sur mesure ? Nous proposons des déploiements personnalisés, 
              des intégrations custom et un support dédié pour les grandes organisations.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <EnhancedButton onClick={handleRequestDemo}>
                Demander une démo
              </EnhancedButton>
              <EnhancedButton variant="outline" onClick={() => setCurrentView('comparison')}>
                Comparer les fonctionnalités
              </EnhancedButton>
              <EnhancedButton variant="outline" onClick={() => setCurrentView('api')}>
                API commerciale
              </EnhancedButton>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>
    </div>
  );

  // Vue de comparaison des fonctionnalités
  const renderFeatureComparison = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Comparaison détaillée</h2>
        <EnhancedButton onClick={() => setCurrentView('plans')} variant="outline" size="sm">
          Retour aux plans
        </EnhancedButton>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-medium">Fonctionnalité</th>
              <th className="text-center p-4 font-medium">Gratuit</th>
              <th className="text-center p-4 font-medium">Basic</th>
              <th className="text-center p-4 font-medium bg-blue-50 dark:bg-blue-900">Premium</th>
              <th className="text-center p-4 font-medium">Business</th>
              <th className="text-center p-4 font-medium">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_COMPARISON.map((category) => (
              <React.Fragment key={category.category}>
                <tr>
                  <td colSpan={6} className="p-4 bg-gray-100 dark:bg-gray-800 font-semibold">
                    {category.category}
                  </td>
                </tr>
                {category.features.map((feature, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-4">{feature.name}</td>
                    <td className="p-4 text-center">{feature.free}</td>
                    <td className="p-4 text-center">{feature.basic}</td>
                    <td className="p-4 text-center bg-blue-50 dark:bg-blue-900">{feature.premium}</td>
                    <td className="p-4 text-center">{feature.business}</td>
                    <td className="p-4 text-center">{feature.enterprise}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Vue API commerciale
  const renderApiPlans = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">API Commerciale</h2>
        <EnhancedButton onClick={() => setCurrentView('plans')} variant="outline" size="sm">
          Retour aux plans
        </EnhancedButton>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            name: 'API Starter',
            price: '49€/mois',
            requests: '50,000 requêtes/mois',
            features: ['Documentation complète', 'Support par email', 'Rate limiting: 100/min']
          },
          {
            name: 'API Professional',
            price: '149€/mois',
            requests: '500,000 requêtes/mois',
            popular: true,
            features: ['Webhooks avancés', 'Support prioritaire', 'Rate limiting: 1000/min', 'Analytics détaillées']
          },
          {
            name: 'API Enterprise',
            price: 'Sur devis',
            requests: 'Requêtes illimitées',
            features: ['SLA 99.9%', 'Support dédié', 'Rate limiting custom', 'Intégrations personnalisées']
          }
        ].map((plan) => (
          <EnhancedCard key={plan.name} variant={plan.popular ? "default" : "elevated"}>
            <EnhancedCardHeader>
              <EnhancedCardTitle>{plan.name}</EnhancedCardTitle>
              <div className="text-2xl font-bold">{plan.price}</div>
              <div className="text-sm text-gray-600">{plan.requests}</div>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <EnhancedButton className="w-full mt-4" variant={plan.popular ? "default" : "outline"}>
                {plan.price === 'Sur devis' ? 'Contacter' : 'Commencer'}
              </EnhancedButton>
            </EnhancedCardContent>
          </EnhancedCard>
        ))}
      </div>

      <EnhancedCard>
        <EnhancedCardHeader>
          <EnhancedCardTitle>Documentation API</EnhancedCardTitle>
          <EnhancedCardDescription>
            Intégrez Dialect Game dans vos applications avec notre API REST complète
          </EnhancedCardDescription>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl mb-2">📚</div>
              <h4 className="font-medium">Documentation</h4>
              <p className="text-sm text-gray-600">API REST complète avec exemples</p>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl mb-2">🔧</div>
              <h4 className="font-medium">SDK</h4>
              <p className="text-sm text-gray-600">Librairies JavaScript, Python, PHP</p>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl mb-2">🔗</div>
              <h4 className="font-medium">Webhooks</h4>
              <p className="text-sm text-gray-600">Notifications temps réel</p>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'plans', label: 'Plans & Tarifs' },
            { id: 'comparison', label: 'Comparaison' },
            { id: 'api', label: 'API' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      {currentView === 'plans' && renderPricingPlans()}
      {currentView === 'comparison' && renderFeatureComparison()}
      {currentView === 'api' && renderApiPlans()}
    </div>
  );
};

export default PricingDashboard;