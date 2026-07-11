import { MapPin, Star } from 'lucide-react';

interface RecommendHeroProps {
  image: string;
  title: string;
  location: string;
  rating: string;
}

export const RecommendHero = ({ image, title, location, rating }: RecommendHeroProps) => {
  return (
    <div className="relative h-[450px] w-full bg-gray-100">
      <img 
        src={image} 
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      <div className="absolute bottom-8 left-8 right-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location}
          </span>
          <span className="bg-yellow-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            {rating}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
          {title}
        </h1>
      </div>
    </div>
  );
};
