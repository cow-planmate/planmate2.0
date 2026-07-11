import { ExternalLink, Heart, MessageCircle } from 'lucide-react';
import React from 'react';
import { CustomOverlayMap, Map } from 'react-kakao-maps-sdk';

interface FeedMapViewProps {
  posts: any[];
  mapState: {
    center: { lat: number; lng: number };
    level: number;
  };
  onNavigate: (view: any, data?: any) => void;
  className?: string;
}

export const FeedMapView: React.FC<FeedMapViewProps> = ({
  posts,
  mapState,
  onNavigate,
  className = "lg:col-span-2"
}) => {
  return (
    <div className={`${className} bg-white rounded-xl shadow-md overflow-hidden h-[700px] border border-gray-100`}>
      <Map
        center={mapState.center}
        level={mapState.level}
        style={{ width: '100%', height: '100%' }}
      >
        {posts.map((post) => (
          post.coords && (
            <CustomOverlayMap
              key={post.id}
              position={post.coords}
            >
              <div 
                className="group relative"
                onClick={() => onNavigate('detail', { post })}
              >
                {/* Pin Marker */}
                <div className="bg-[#1344FF] text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-white">
                  <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
                </div>

                {/* Info Card Hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-60 bg-white rounded-2xl shadow-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 border border-gray-100 transform group-hover:-translate-y-1">
                  <div className="relative h-32">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-[#1344FF]">
                      {post.destination}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-bold text-[#1a1a1a] mb-1 truncate">{post.title}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-[#666666]">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {post.comments}
                      </span>
                      <span className="ml-auto flex items-center gap-1 text-[#1344FF] font-bold">
                        자세히 보기
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                </div>
              </div>
            </CustomOverlayMap>
          )
        ))}
      </Map>
    </div>
  );
};
