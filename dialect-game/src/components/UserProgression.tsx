/**
 * TDD CYCLE 4 - GREEN PHASE
 * User Progression Component avec XP, Level, Achievements, Stats
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'

// Types pour la progression utilisateur
interface UserStats {
  totalWords: number
  accuracy: number
  averageTime: number
  currentLevel: number
  experience: number
  maxExperience: number
}

interface Achievement {
  id: string
  name: string
  description: string
  unlocked: boolean
  unlockedAt?: Date
}

interface DailyChallenge {
  id: string
  description: string
  progress: number
  target: number
  reward: string
  completed: boolean
}

export const UserProgression: React.FC = () => {
  // États pour la progression
  const [userStats, setUserStats] = useState<UserStats>({
    totalWords: 0,
    accuracy: 0,
    averageTime: 0,
    currentLevel: 1,
    experience: 50,
    maxExperience: 100
  })

  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first_word', name: 'Premier Mot', description: 'Prononcer votre premier mot', unlocked: false },
    { id: 'speed_demon', name: 'Rapide', description: 'Compléter 5 mots en moins de 10s', unlocked: false }
  ])

  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>({
    id: 'daily_words',
    description: 'Prononcer 10 mots aujourd\'hui',
    progress: 0,
    target: 10,
    reward: '50 XP',
    completed: false
  })

  const [announcement, setAnnouncement] = useState<string>('')
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false)
  const [showAchievementModal, setShowAchievementModal] = useState<Achievement | null>(null)

  // Handlers pour les actions utilisateur
  const handleAddExperience = useCallback((amount: number = 60) => {
    setUserStats(prev => {
      const newExperience = prev.experience + amount
      const newLevel = prev.currentLevel
      
      if (newExperience >= prev.maxExperience) {
        // Level up !
        setShowLevelUp(true)
        setAnnouncement(`Level up! You reached level ${newLevel + 1}`)
        
        setTimeout(() => setShowLevelUp(false), 3000)
        
        return {
          ...prev,
          currentLevel: newLevel + 1,
          experience: newExperience - prev.maxExperience,
          maxExperience: prev.maxExperience + 50 // Augmenter la difficulté
        }
      }
      
      return { ...prev, experience: newExperience }
    })
  }, [])

  const handleCompleteWord = useCallback(() => {
    // Simuler la complétion d'un mot
    setUserStats(prev => ({
      ...prev,
      totalWords: prev.totalWords + 1,
      accuracy: Math.min(100, prev.accuracy + 2),
      averageTime: Math.max(1, prev.averageTime - 0.1)
    }))

    // Vérifier les achievements
    checkAchievements()
    
    // Mettre à jour le challenge quotidien
    setDailyChallenge(prev => ({
      ...prev,
      progress: Math.min(prev.target, prev.progress + 1),
      completed: prev.progress + 1 >= prev.target
    }))

    // Ajouter de l'expérience
    handleAddExperience(10)
  }, [handleAddExperience])

  const checkAchievements = useCallback(() => {
    setAchievements(prev => prev.map(achievement => {
      if (!achievement.unlocked) {
        let shouldUnlock = false
        
        if (achievement.id === 'first_word' && userStats.totalWords >= 0) {
          shouldUnlock = true
        } else if (achievement.id === 'speed_demon' && userStats.averageTime <= 2) {
          shouldUnlock = true
        }
        
        if (shouldUnlock) {
          setShowAchievementModal(achievement)
          setAnnouncement(`Achievement unlocked: ${achievement.name}`)
          setTimeout(() => setShowAchievementModal(null), 3000)
          
          return { ...achievement, unlocked: true, unlockedAt: new Date() }
        }
      }
      return achievement
    }))
  }, [userStats.totalWords, userStats.averageTime])

  // Calculer le pourcentage d'expérience
  const experiencePercentage = (userStats.experience / userStats.maxExperience) * 100

  return (
    <div data-testid="user-progression-container" className="p-6 space-y-6">
      {/* Level et Experience */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div data-testid="level-display" className="text-2xl font-bold">
            Level: {userStats.currentLevel}
          </div>
          <div data-testid="experience-display" className="text-lg">
            XP: {userStats.experience}/{userStats.maxExperience}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div 
            data-testid="progress-bar"
            className="w-full h-4 bg-gray-200 rounded-full overflow-hidden"
          >
            <div 
              data-testid="experience-progress"
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${experiencePercentage}%` }}
              aria-valuenow={userStats.experience}
              aria-valuemax={userStats.maxExperience}
              role="progressbar"
            />
          </div>
          <div className="text-sm text-gray-600">
            {Math.round(experiencePercentage)}% to next level
          </div>
        </div>
      </div>

      {/* Level Up Animation */}
      {showLevelUp && (
        <div 
          data-testid="level-up-notification"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div 
            data-testid="level-up-animation"
            className="bg-white p-8 rounded-lg text-center animate-bounce"
          >
            <h2 className="text-3xl font-bold text-yellow-500">LEVEL UP!</h2>
            <p className="text-xl">You reached level {userStats.currentLevel}!</p>
          </div>
        </div>
      )}

      {/* Achievements Section */}
      <div data-testid="achievements-section" className="space-y-4">
        <h3 className="text-xl font-bold">Achievements</h3>
        <div className="grid grid-cols-2 gap-4">
          {achievements.map(achievement => (
            <div 
              key={achievement.id}
              data-testid={`achievement-${achievement.id}`}
              className={`p-4 border rounded-lg ${
                achievement.unlocked ? 'bg-yellow-100 border-yellow-300 unlocked' : 'bg-gray-100 border-gray-300'
              }`}
            >
              <h4 className="font-bold">{achievement.name}</h4>
              <p className="text-sm text-gray-600">{achievement.description}</p>
              {achievement.unlocked && (
                <div className="text-green-600 text-sm mt-2">✓ Unlocked</div>
              )}
            </div>
          ))}
        </div>
        
        {achievements.every(a => !a.unlocked) && (
          <div data-testid="achievements-list" className="text-gray-500">
            No achievements yet
          </div>
        )}
      </div>

      {/* Achievement Unlock Modal */}
      {showAchievementModal && (
        <div 
          data-testid="achievement-unlocked-modal"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-yellow-500">Achievement Unlocked!</h2>
            <h3 className="text-xl">{showAchievementModal.name}</h3>
            <p className="text-gray-600">{showAchievementModal.description}</p>
          </div>
        </div>
      )}

      {/* Statistics Section */}
      <div data-testid="stats-section" className="space-y-4">
        <h3 className="text-xl font-bold">Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div data-testid="total-words-stat" className="text-center p-4 bg-blue-50 rounded">
            <div className="text-2xl font-bold">{userStats.totalWords}</div>
            <div className="text-sm text-gray-600">Total Words: {userStats.totalWords}</div>
          </div>
          <div data-testid="accuracy-stat" className="text-center p-4 bg-green-50 rounded">
            <div className="text-2xl font-bold">{Math.round(userStats.accuracy)}%</div>
            <div className="text-sm text-gray-600">Accuracy: {Math.round(userStats.accuracy)}%</div>
          </div>
          <div data-testid="average-time-stat" className="text-center p-4 bg-purple-50 rounded">
            <div className="text-2xl font-bold">{userStats.averageTime.toFixed(1)}s</div>
            <div className="text-sm text-gray-600">Avg Time: {userStats.averageTime.toFixed(1)}s</div>
          </div>
        </div>
      </div>

      {/* Daily Challenge Section */}
      <div data-testid="daily-challenge-section" className="space-y-4">
        <h3 className="text-xl font-bold">Daily Challenge</h3>
        <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <p className="font-medium">{dailyChallenge.description}</p>
          <div 
            data-testid="challenge-progress" 
            className="mt-2 w-full bg-gray-200 rounded-full h-2"
          >
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${(dailyChallenge.progress / dailyChallenge.target) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm">{dailyChallenge.progress}/{dailyChallenge.target}</span>
            <div data-testid="challenge-reward" className="text-sm font-medium text-purple-600">
              Reward: {dailyChallenge.reward}
            </div>
          </div>
          {dailyChallenge.completed && (
            <div className="text-green-600 font-bold mt-2">✓ Challenge Completed!</div>
          )}
        </div>
      </div>

      {/* Action Buttons pour les tests */}
      <div className="flex gap-4">
        <Button 
          data-testid="add-xp-button"
          onClick={() => handleAddExperience()}
          variant="default"
        >
          Add XP (Test)
        </Button>
        <Button 
          data-testid="complete-word-button"
          onClick={handleCompleteWord}
          variant="secondary"
        >
          Complete Word (Test)
        </Button>
      </div>

      {/* Accessibility Announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        className="sr-only"
      >
        {announcement}
      </div>
    </div>
  )
}

export default UserProgression