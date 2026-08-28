interface ExtraFieldsProps {
  type: 'free' | 'qna' | 'recommend';
  location: string;
  setLocation: (val: string) => void;
  rating: string;
  setRating: (val: string) => void;
}

export const ExtraFields = ({
  type,
  location,
  setLocation,
  rating,
  setRating,
}: ExtraFieldsProps) => {
  return null;
};
