interface GuidelineSectionProps {
  type: string;
  tips: string[];
}

export const GuidelineSection = ({ type, tips }: GuidelineSectionProps) => {
  const boardName = type === 'qna' ? '질문게시판' : '자유게시판';

  return (
    <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
      <h3 className="text-xs font-bold text-[#1344FF] mb-1.5">💡 {boardName} 작성 팁</h3>
      <ul className="text-sm text-blue-700/80 space-y-1 list-disc list-inside">
        {tips.map((tip, index) => (
          <li key={index}>{tip}</li>
        ))}
      </ul>
    </div>
  );
};
