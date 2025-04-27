import Link from 'next/link';

interface HeaderProps {
  title: string;
  backUrl?: string;
  rightElement?: React.ReactNode;
}

export default function Header({ title, backUrl, rightElement }: HeaderProps) {
  return (
    <header className="nav-header">
      <div className="flex items-center justify-between w-full">
        <div className="w-10">
          {backUrl && (
            <Link href={backUrl} className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
          )}
        </div>
        
        <h1 className="text-center text-lg font-bold uppercase">{title}</h1>
        
        <div className="w-10 flex justify-end">
          {rightElement}
        </div>
      </div>
    </header>
  );
} 