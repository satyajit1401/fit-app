import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Workouts', path: '/workouts', pattern: /^\/workouts(?:\/.*)?$/ },
    { name: 'Nutrition', path: '/nutrition', pattern: /^\/nutrition(?:\/.*)?$/ },
    { name: 'Analytics', path: '/analytics', pattern: /^\/analytics(?:\/.*)?$/ },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-gray-700">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto">
        {navItems.map((item) => {
          const isActive = item.pattern.test(pathname);
          
          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={`inline-flex flex-col items-center justify-center font-medium px-5 hover:bg-gray-800 transition-colors ${
                isActive ? 'text-accent' : 'text-text-light'
              }`}
            >
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 