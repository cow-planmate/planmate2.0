import { BlockNoteView } from "@blocknote/mantine";
import React from 'react';
import { SectionTitle } from '../atoms/SectionTitle';

interface PostEditorSectionProps {
  editor: any;
}

export const PostEditorSection: React.FC<PostEditorSectionProps> = ({ editor }) => {
  // 에디터 본문(첫 줄)이 아니라 네모칸 여백 아무 곳이나 눌러도 작성이 시작되도록 한다.
  const focusEditorAtEnd = (e: React.MouseEvent<HTMLDivElement>) => {
    // 슬래시 메뉴/툴바 같은 BlockNote UI는 .bn-container 안에 에디터와 형제로 렌더된다.
    // 그 위에서 preventDefault + focus 를 하면 메뉴가 닫혀 click 이 발생하지 않으므로
    // 진짜 빈 여백(래퍼 자신 또는 .bn-container)일 때만 포커스를 옮긴다.
    const target = e.target as HTMLElement;
    const isBlankArea = target === e.currentTarget || target.classList.contains('bn-container');
    if (!isBlankArea) return;
    e.preventDefault();
    const blocks = editor.document;
    const last = blocks[blocks.length - 1];
    if (last) {
      editor.setTextCursorPosition(last, 'end');
    }
    editor.focus();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <SectionTitle title="여행 후기" required>
        <div className="text-xs font-bold text-[#999999] bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-2">
          <span>메뉴 열기</span>
          <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200 font-mono text-[10px] text-[#1344FF]">/</span>
        </div>
      </SectionTitle>

      <div
        onMouseDown={focusEditorAtEnd}
        className="min-h-[500px] border border-[#e5e7eb] rounded-2xl bg-white focus-within:ring-4 focus-within:ring-[#1344FF]/5 focus-within:border-[#1344FF] transition-all overflow-hidden cursor-text"
      >
        <BlockNoteView editor={editor} theme="light" />
      </div>
    </div>
  );
};
