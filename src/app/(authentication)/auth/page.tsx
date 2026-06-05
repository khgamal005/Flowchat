'use client';

import { FcGoogle } from 'react-icons/fc';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

import Typography from '@/components/ui/typography';
import { Button } from '@/components/ui/button';

const AuthPage = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  async function socialAuth(provider: string) {
    setIsAuthenticating(true);
    await signIn(provider, { redirectTo: '/' });
    setIsAuthenticating(false);
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-xl shadow-indigo-100/50 p-8 sm:p-10'>
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold mb-4'>
              F
            </div>
            <Typography
              text='Flowchat'
              variant='h2'
              className='text-3xl font-bold text-gray-900'
            />
            <Typography
              text='Sign in to your account'
              variant='p'
              className='text-gray-500 mt-2'
            />
          </div>

          <Button
            disabled={isAuthenticating}
            variant='outline'
            className='w-full py-6 border-2 border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 flex items-center justify-center gap-3 rounded-xl transition-all duration-200'
            onClick={() => socialAuth('google')}
          >
            <FcGoogle size={24} />
            <span className='text-base font-medium text-gray-700'>
              Continue with Google
            </span>
          </Button>

          <p className='text-xs text-gray-400 text-center mt-6'>
            By continuing, you agree to Flowchat&apos;s Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;