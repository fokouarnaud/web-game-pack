import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';

const TestComponents: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Test des composants shadcn/ui
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Vérification complète du bon fonctionnement des composants UI avec Tailwind CSS v3
          </p>
        </div>

        {/* Alert de test */}
        {showAlert && (
          <Alert className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">✅ Configuration réussie !</h4>
                <p className="text-sm mt-1">
                  Tous les composants shadcn/ui sont correctement configurés avec Tailwind CSS v3.
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAlert(false)}
              >
                ✕
              </Button>
            </div>
          </Alert>
        )}

        {/* Test des boutons */}
        <Card>
          <CardHeader>
            <CardTitle>Composants Button</CardTitle>
            <CardDescription>
              Test de toutes les variantes et tailles de boutons disponibles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Variantes</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Tailles</h3>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">🚀</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">États</h3>
              <div className="flex flex-wrap gap-3">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
                <Button className="animate-pulse">Loading</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test des formulaires */}
        <Card>
          <CardHeader>
            <CardTitle>Composants de formulaire</CardTitle>
            <CardDescription>
              Input, Label, Textarea et autres éléments de formulaire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-input">Input standard</Label>
                  <Input 
                    id="test-input"
                    placeholder="Tapez quelque chose..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="test-textarea">Textarea</Label>
                  <Textarea 
                    id="test-textarea"
                    placeholder="Votre message..."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Badges</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                </div>
                
                <div>
                  <Label>Actions</Label>
                  <div className="flex gap-2 mt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Ouvrir Dialog</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Test Dialog</DialogTitle>
                          <DialogDescription>
                            Ceci est un exemple de dialog avec shadcn/ui.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Le contenu du dialog peut inclure du texte, des formulaires,
                            ou tout autre composant React.
                          </p>
                        </div>
                        <DialogFooter>
                          <Button variant="outline">Annuler</Button>
                          <Button>Confirmer</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test du mode sombre et responsive */}
        <Card>
          <CardHeader>
            <CardTitle>Test du mode sombre et responsive</CardTitle>
            <CardDescription>
              Adaptation automatique aux préférences de l'utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Thème adaptatif
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Ce contenu s'adapte automatiquement au mode sombre.
                </p>
                <Button variant="outline" size="sm">Action</Button>
              </div>
              
              <div className="p-6 bg-primary text-primary-foreground rounded-lg">
                <h3 className="font-medium mb-2">Variables CSS</h3>
                <p className="opacity-90 text-sm mb-4">
                  Utilisation des variables CSS de shadcn/ui pour un thème cohérent.
                </p>
                <Button variant="secondary" size="sm">Action</Button>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg">
                <h3 className="font-medium mb-2">Tailwind intégré</h3>
                <p className="opacity-90 text-sm mb-4">
                  Gradients et classes Tailwind fonctionnent parfaitement.
                </p>
                <Button variant="outline" size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                  Action
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test des skeletons et loading states */}
        <Card>
          <CardHeader>
            <CardTitle>États de chargement</CardTitle>
            <CardDescription>
              Composants Skeleton pour les états de chargement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Skeleton examples</h4>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Contenu chargé</h4>
                <div className="space-y-2">
                  <p className="text-sm">Ligne de contenu 1</p>
                  <p className="text-sm">Ligne de contenu 2</p>
                  <p className="text-sm">Ligne de contenu 3</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    U
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Nom d'utilisateur</p>
                    <p className="text-xs text-gray-500">En ligne</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-gray-500">
              ✅ Tous les composants shadcn/ui sont fonctionnels avec Tailwind CSS v3 !
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TestComponents;
