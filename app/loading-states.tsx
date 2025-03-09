import React from 'react';
import { Loader2, CheckCircle, Sparkles, CircleAlert, Image as ImageIcon } from 'lucide-react';

export const RecipeGenerationSteps = ({
  currentStep = 1,
}: {
  currentStep?: number;
}) => {
  const steps = [
    {
      title: "Analyzing ingredients & request",
      description: "Identifying ingredients and understanding your requirements",
      complete: currentStep > 1,
      current: currentStep === 1,
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      title: "Crafting your recipe",
      description: "Creating a personalized recipe with measurements and instructions",
      complete: currentStep > 2,
      current: currentStep === 2,
      icon: <CircleAlert className="h-4 w-4" />,
    },
    {
      title: "Creating recipe visualization",
      description: "Generating a beautiful image of the completed dish",
      complete: currentStep > 3,
      current: currentStep === 3,
      icon: <ImageIcon className="h-4 w-4" />,
    },
    {
      title: "Final touches",
      description: "Adding nutritional information and finalizing details",
      complete: currentStep > 4,
      current: currentStep === 4,
      icon: <CheckCircle className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recipe Generation Process</h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`
              flex items-start gap-3 p-3 rounded-lg transition-all
              ${step.current ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50' : 
                step.complete ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50' : 
                'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50'}
            `}
          >
            <div className={`
              flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm
              ${step.complete ? 'bg-green-100 text-green-600 dark:bg-green-900/70 dark:text-green-300' : 
                step.current ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/70 dark:text-blue-300' : 
                'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}
            `}>
              {step.complete ? (
                <CheckCircle className="h-4 w-4" />
              ) : step.current ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                step.icon || <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {step.title}
                {step.current && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    In progress
                  </span>
                )}
                {step.complete && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Complete
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{step.description}</p>
              
              {/* Progress animation for current step */}
              {step.current && (
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-blue-500 dark:bg-blue-400 animate-progress rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ImageGenerationIndicator = () => {
  return (
    <div className="flex flex-col mt-4 p-3 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
        <div className="p-1 bg-blue-100 dark:bg-blue-800 rounded-full">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
        <span className="text-sm font-medium">Creating an AI image of your dish</span>
      </div>
      <div className="mt-2 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 dark:bg-blue-400 animate-progress rounded-full"></div>
      </div>
      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
        Our AI is generating a custom image based on your recipe's ingredients and instructions
      </p>
    </div>
  );
};

// Add a keyframe animation for the progress bar
export const injectGlobalStyles = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes progress {
        0% { width: 5%; }
        50% { width: 70%; }
        100% { width: 95%; }
      }
      .animate-progress {
        animation: progress 3s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
  }
};

// Call the function to inject styles
if (typeof window !== 'undefined') {
  injectGlobalStyles();
} 