import { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { HotPostCard } from '../molecules/HotPostCard';

const AUTOPLAY_DELAY_MS = 10_000;
const MOBILE_BREAKPOINT = '(max-width: 767px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

interface HotPostsGridProps {
  hotPosts: any[];
  type: string;
  onNavigate: (view: any, data?: any) => void;
}

export const HotPostsGrid = ({ hotPosts, type, onNavigate }: HotPostsGridProps) => {
  const visibleHotPosts = hotPosts.slice(0, 3);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: visibleHotPosts.length > 1,
    breakpoints: {
      '(min-width: 768px)': { active: false },
    },
  });

  useEffect(() => {
    if (!emblaApi || visibleHotPosts.length < 2) return;

    const mobileMedia = window.matchMedia(MOBILE_BREAKPOINT);
    const reducedMotionMedia = window.matchMedia(REDUCED_MOTION_QUERY);
    let autoplayTimer: ReturnType<typeof window.setTimeout> | undefined;

    const stopAutoplay = () => {
      if (autoplayTimer === undefined) return;
      window.clearTimeout(autoplayTimer);
      autoplayTimer = undefined;
    };

    const scheduleAutoplay = () => {
      stopAutoplay();
      if (!mobileMedia.matches || reducedMotionMedia.matches || document.hidden) return;

      autoplayTimer = window.setTimeout(() => {
        if (emblaApi.canScrollNext()) {
          emblaApi.scrollNext();
        } else {
          emblaApi.scrollTo(0);
        }
        scheduleAutoplay();
      }, AUTOPLAY_DELAY_MS);
    };

    emblaApi.on('pointerDown', stopAutoplay);
    emblaApi.on('pointerUp', scheduleAutoplay);
    mobileMedia.addEventListener('change', scheduleAutoplay);
    reducedMotionMedia.addEventListener('change', scheduleAutoplay);
    document.addEventListener('visibilitychange', scheduleAutoplay);
    scheduleAutoplay();

    return () => {
      stopAutoplay();
      emblaApi.off('pointerDown', stopAutoplay);
      emblaApi.off('pointerUp', scheduleAutoplay);
      mobileMedia.removeEventListener('change', scheduleAutoplay);
      reducedMotionMedia.removeEventListener('change', scheduleAutoplay);
      document.removeEventListener('visibilitychange', scheduleAutoplay);
    };
  }, [emblaApi, visibleHotPosts.length]);

  return (
    <section className="mb-4 md:mb-7" aria-labelledby="hot-posts-heading">
      <h2 id="hot-posts-heading" className="sr-only">지금 뜨는 글</h2>
      <div
        ref={emblaRef}
        className="-mx-3 cursor-grab overflow-hidden px-3 pb-1 active:cursor-grabbing md:mx-0 md:cursor-auto md:overflow-visible md:px-0 md:pb-0"
        role="group"
        aria-labelledby="hot-posts-heading"
        aria-roledescription="carousel"
      >
        <div className="flex touch-pan-y select-none items-stretch gap-3 md:grid md:grid-cols-3 md:items-start md:gap-3 md:select-auto">
          {visibleHotPosts.map((post, index) => (
            <HotPostCard
              key={post.id}
              post={post}
              index={index}
              type={type}
              onClick={() => onNavigate('detail', { post: { ...post, category: type } })}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
