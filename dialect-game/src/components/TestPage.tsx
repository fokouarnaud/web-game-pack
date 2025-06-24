/**
 * Test page pour vérifier que TailwindCSS fonctionne
 */

import React from 'react';

export const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ✅ TailwindCSS Test
        </h1>
        <p className="text-gray-600 mb-4">
          Si vous voyez cette page avec du style, TailwindCSS fonctionne !
        </p>
        <div className="space-y-2">
          <div className="bg-red-500 text-white p-2 rounded">Rouge</div>
          <div className="bg-green-500 text-white p-2 rounded">Vert</div>
          <div className="bg-blue-500 text-white p-2 rounded">Bleu</div>
        </div>
        <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors">
          Bouton Test
        </button>
      </div>
    </div>
  );
};

export default TestPage;