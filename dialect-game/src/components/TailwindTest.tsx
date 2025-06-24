/**
 * Component de test pour vérifier que Tailwind CSS fonctionne
 */

import React from 'react';

export const TailwindTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Tailwind CSS Test
        </h1>
        <p className="text-gray-600 mb-6">
          Si vous voyez ce composant avec des styles colorés, Tailwind CSS fonctionne correctement !
        </p>
        <div className="space-y-4">
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors">
            Bouton Bleu
          </button>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors">
            Bouton Vert
          </button>
          <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors">
            Bouton Rouge
          </button>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          <div className="h-16 bg-pink-300 rounded"></div>
          <div className="h-16 bg-yellow-300 rounded"></div>
          <div className="h-16 bg-indigo-300 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;