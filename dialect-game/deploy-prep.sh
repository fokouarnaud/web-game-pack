#!/bin/bash
# Script de préparation pour déploiement Netlify
# Dialect Learning Game - Phase 3 Ready

echo "🚀 Préparation du déploiement Netlify..."
echo "📍 Répertoire: $(pwd)"

# 1. Nettoyage des builds précédents
echo "🧹 Nettoyage..."
rm -rf dist/
rm -rf node_modules/.vite/

# 2. Installation des dépendances
echo "📦 Installation des dépendances..."
npm ci

# 3. Build de production
echo "🔨 Build de production..."
npm run build

# 4. Vérification du build
if [ -d "dist" ]; then
    echo "✅ Build réussi!"
    echo "📁 Contenu du dossier dist/:"
    ls -la dist/
    
    # Calcul de la taille
    SIZE=$(du -sh dist/ | cut -f1)
    echo "📊 Taille du build: $SIZE"
    
    # Vérification des fichiers critiques
    if [ -f "dist/index.html" ]; then
        echo "✅ index.html présent"
    else
        echo "❌ index.html manquant!"
        exit 1
    fi
    
    if [ -f "dist/_redirects" ]; then
        echo "✅ _redirects présent"
    else
        echo "❌ _redirects manquant!"
        exit 1
    fi
    
    if [ -f "dist/_headers" ]; then
        echo "✅ _headers présent"
    else
        echo "❌ _headers manquant!"
        exit 1
    fi
    
    echo ""
    echo "🎉 Build prêt pour déploiement!"
    echo "📋 Instructions:"
    echo "   1. Aller sur https://app.netlify.com"
    echo "   2. Cliquer sur 'Add new site' → 'Deploy manually'"
    echo "   3. Glisser-déposer le dossier 'dist/'"
    echo ""
    echo "🌐 Ou utiliser Netlify CLI:"
    echo "   netlify deploy --prod --dir=dist"
    
else
    echo "❌ Échec du build!"
    exit 1
fi