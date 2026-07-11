import { BlockNoteView } from "@blocknote/mantine";
import React from 'react';
import { SectionTitle } from '../atoms/SectionTitle';

interface PostEditorSectionProps {
  editor: any;
}

export const PostEditorSection: React.FC<PostEditorSectionProps> = ({ editor }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <SectionTitle title="여행 후기" required>
        <div className="text-xs font-bold text-[#999999] bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-2">
          <span>메뉴 열기</span>
          <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200 font-mono text-[10px] text-[#1344FF]">/</span>
        </div>
      </SectionTitle>
      
      <div className="min-h-[500px] border border-[#e5e7eb] rounded-2xl bg-white focus-within:ring-4 focus-within:ring-[#1344FF]/5 focus-within:border-[#1344FF] transition-all overflow-hidden">
        <BlockNoteView editor={editor} theme="light" />
      </div>
    </div>
  );
};
