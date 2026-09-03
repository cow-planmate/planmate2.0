import {
  CalendarRange,
  ChevronRight,
  LayoutGrid,
  NotebookPen,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

export type MyPageMenuSection = "profile" | "trips" | "community";

interface MyPageContentPageProps {
  activeSection: MyPageMenuSection;
  onSectionChange: (section: MyPageMenuSection) => void;
  title: string;
  description: string;
  eyebrow: string;
  icon: LucideIcon;
  children: ReactNode;
}

const SECTION_LINKS = [
  { id: "profile", label: "프로필", icon: UserRound },
  { id: "trips", label: "여행 일정 및 캘린더", icon: CalendarRange },
  { id: "community", label: "커뮤니티 활동", icon: NotebookPen },
] as const;

export function MyPageContentPage({
  activeSection,
  onSectionChange,
  title,
  description,
  eyebrow,
  icon: Icon,
  children,
}: MyPageContentPageProps) {
  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#f6f7f9]">
      <div className="mx-auto grid max-w-[1480px] lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-70px)] border-r border-slate-200/80 bg-white px-5 py-9 lg:block">
          <div className="flex items-center gap-2 px-3 text-sm font-black tracking-[-0.02em] text-slate-950">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white">
              <LayoutGrid className="h-4 w-4" />
            </span>
            내 여행 관리
          </div>
          <nav className="mt-8 space-y-1" aria-label="마이페이지 메뉴">
            {SECTION_LINKS.map(({ id, label, icon: LinkIcon }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onSectionChange(id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1344FF] ${
                    isActive
                      ? "bg-[#eef3ff] text-[#1344FF]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <LinkIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                  <span className="flex-1">{label}</span>
                  <ChevronRight className={`h-4 w-4 ${isActive ? "text-[#1344FF]" : "text-slate-300"}`} aria-hidden="true" />
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 px-4 pb-16 pt-6 sm:px-7 sm:pt-8 lg:px-10 xl:px-14">
          <div className="mx-auto max-w-[1120px]">
            <header className="mb-7 sm:mb-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#1344FF] shadow-[0_5px_18px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-[11px] font-black tracking-[0.16em] text-[#1344FF]">{eyebrow}</p>
              </div>
              <h1 className="mt-3 break-keep text-[32px] font-black leading-tight tracking-[-0.055em] text-slate-950 sm:text-[42px]">{title}</h1>
              <p className="mt-1.5 max-w-2xl break-keep text-sm leading-5 text-slate-500 sm:text-[15px]">{description}</p>

              <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="마이페이지 메뉴">
                {SECTION_LINKS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSectionChange(id)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${activeSection === id ? "bg-slate-950 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </header>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
