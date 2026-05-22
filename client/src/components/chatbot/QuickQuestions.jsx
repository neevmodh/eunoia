import React from 'react';

const quickQuestions = {
  en: [
    'What are normal period symptoms?',
    'How to manage period cramps?',
    'What foods help during periods?',
    'Is it normal to have irregular periods?',
    'How to track my cycle?',
    'What is PMS?',
  ],
  hi: [
    'सामान्य पीरियड लक्षण क्या हैं?',
    'पीरियड दर्द कैसे कम करें?',
    'पीरियड में क्या खाएं?',
    'अनियमित पीरियड सामान्य है?',
    'अपना साइकिल कैसे ट्रैक करें?',
    'PMS क्या होता है?',
  ],
  hinglish: [
    'Normal period symptoms kya hain?',
    'Period cramps kaise kam karein?',
    'Periods mein kya khana chahiye?',
    'Irregular periods normal hai?',
    'Apna cycle kaise track karein?',
    'PMS kya hota hai?',
  ]
};

const QuickQuestions = ({ onSelect, language = 'en' }) => {
  const questions = quickQuestions[language] || quickQuestions.en;

  return (
    <div className="px-4 pb-3">
      <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            className="text-xs bg-sakhi-50 dark:bg-sakhi-900/20 hover:bg-sakhi-100 dark:hover:bg-sakhi-900/40 text-sakhi-600 dark:text-sakhi-300 border border-sakhi-200 dark:border-sakhi-800 px-3 py-1.5 rounded-full transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickQuestions;
