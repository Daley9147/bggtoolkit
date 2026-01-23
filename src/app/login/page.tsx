'use client';

import { createClient } from '@/lib/supabase/client';
import AppLogo from '@/components/common/app-logo';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Login() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);


  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900/50 dark:backdrop-blur-sm border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-48">
            <AppLogo />
          </div>
          <h2 className="text-center text-2xl font-bold tracking-tight text-[#2CB5B5] dark:text-[#2CB5B5]">
            Sign in to your account
          </h2>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2CB5B5',
                  brandAccent: '#249a9a',
                },
              },
            },
            className: {
              container: 'w-full',
              button: 'w-full px-4 py-2 rounded-lg font-medium transition-colors',
              input: 'w-full px-4 py-2 rounded-lg border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            },
          }}
          providers={[]}
          view="sign_in"
          showLinks={false}
          theme="dark"
        />
      </div>
    </div>
  );
}
