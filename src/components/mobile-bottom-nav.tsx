'use client';

import { FC } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { HiHome, HiChat, HiUser } from 'react-icons/hi';
import { AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileBottomNav: FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (pattern: string) => pathname?.includes(pattern);

  const navItems = [
    { icon: HiHome, label: 'Home', pattern: '/workspace/', onClick: () => {
      const match = pathname?.match(/\/workspace\/([^/]+)/);
      if (match) router.push(`/workspace/${match[1]}`);
    }},
    { icon: HiChat, label: 'DMs', pattern: '/direct-message', onClick: () => {
      const match = pathname?.match(/\/workspace\/([^/]+)/);
      if (match) router.push(`/workspace/${match[1]}`);
    }},
    { icon: AtSign, label: 'Mentions', pattern: '/mentions', onClick: () => {} },
    { icon: HiUser, label: 'Profile', pattern: '/profile', onClick: () => {} },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-gray-700 md:hidden h-14 safe-area-bottom">
      {navItems.map(({ icon: Icon, label, pattern, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] px-3 py-1 rounded-md transition-colors',
            isActive(pattern)
              ? 'text-primary'
              : 'text-gray-500 dark:text-gray-400'
          )}
          aria-label={label}
        >
          <Icon size={22} />
          <span className="text-[10px] leading-tight">{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
