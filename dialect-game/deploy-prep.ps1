# Script de préparation pour déploiement Netlify
# Dialect Learning Game - Phase 3 Ready

Write-Host "🚀 Préparation du déploiement Netlify..." -ForegroundColor Green
Write-Host "📍 Répertoire: $(Get-Location)" -ForegroundColor Blue

# 1. Nettoyage des builds précédents
Write-Host "🧹 Nettoyage..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
}

# 2. Installation des dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm ci

# 3. Build de production
Write-Host "🔨 Build de production..." -ForegroundColor Yellow
npm run build

# 4. Vérification du build
if (Test-Path "dist") {
    Write-Host "✅ Build réussi!" -ForegroundColor Green
    Write-Host "📁 Contenu du dossier dist/:" -ForegroundColor Blue
    Get-ChildItem "dist" | Format-Table Name, Length, LastWriteTime
    
    # Calcul de la taille
    $Size = (Get-ChildItem -Recurse "dist" | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "📊 Taille du build: $([math]::Round($Size, 2)) MB" -ForegroundColor Blue
    
    # Vérification des fichiers critiques
    $criticalFiles = @("index.html", "_redirects", "_headers")
    $allPresent = $true
    
    foreach ($file in $criticalFiles) {
        if (Test-Path "dist\$file") {
            Write-Host "✅ $file présent" -ForegroundColor Green
        } else {
            Write-Host "❌ $file manquant!" -ForegroundColor Red
            $allPresent = $false
        }
    }
    
    if ($allPresent) {
        Write-Host ""
        Write-Host "🎉 Build prêt pour déploiement!" -ForegroundColor Green
        Write-Host "📋 Instructions:" -ForegroundColor Cyan
        Write-Host "   1. Aller sur https://app.netlify.com" -ForegroundColor White
        Write-Host "   2. Se connecter avec votre compte" -ForegroundColor White
        Write-Host "   3. Cliquer sur 'Add new site' → 'Deploy manually'" -ForegroundColor White
        Write-Host "   4. Glisser-déposer le dossier 'dist/'" -ForegroundColor White
        Write-Host ""
        Write-Host "🌐 Ou utiliser Netlify CLI:" -ForegroundColor Cyan
        Write-Host "   netlify deploy --prod --dir=dist" -ForegroundColor White
        Write-Host ""
        Write-Host "🔍 Tester ensuite sur:" -ForegroundColor Cyan
        Write-Host "   https://your-site.netlify.app/game-lesson?lessonId=chapter-1-lesson-1&chapterNumber=1" -ForegroundColor White
    } else {
        Write-Host "❌ Fichiers critiques manquants!" -ForegroundColor Red
        exit 1
    }
    
} else {
    Write-Host "❌ Échec du build!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "💡 Tip: Pour automatiser les futurs déploiements, connectez votre repo Git à Netlify!" -ForegroundColor Yellow