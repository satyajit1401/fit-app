'use client';

import Link from 'next/link';
import React from 'react';

const ConfirmationPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600 dark:text-blue-400">FitMaxxer 9000</h1>
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white">Email Confirmation</h2>
        
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-5 rounded mb-6">
          <p className="font-medium text-center">
            Thanks for signing up! Please check your email for a confirmation link.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 dark:text-white mb-2">What's next?</h3>
            <ol className="list-decimal pl-5 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Click the confirmation link in your email</li>
              <li>Once confirmed, you'll be able to sign in</li>
              <li>Set up your profile and start tracking your fitness journey</li>
            </ol>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Didn't receive an email? Check your spam folder or try signing up again.
            </p>
            
            <Link href="/auth/login" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition duration-300">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage; 