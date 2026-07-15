import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useMemo } from 'react';

interface PostContentViewerProps {
  content: unknown; // BlockNote 블록 JSON
  contentText?: string;
}

/** 저장된 BlockNote 블록을 읽기 전용으로 렌더링. 블록 파싱 실패 시 평문 fallback. */
export const PostContentViewer = ({ content, contentText }: PostContentViewerProps) => {
  const blocks = useMemo(() => {
    if (Array.isArray(content) && content.length > 0) return content as any[];
    return null;
  }, [content]);

  if (!blocks) {
    return (
      <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
        {contentText || ''}
      </div>
    );
  }

  return <BlockNoteReadOnly blocks={blocks} />;
};

const BlockNoteReadOnly = ({ blocks }: { blocks: any[] }) => {
  const editor = useCreateBlockNote({ initialContent: blocks });
  return <BlockNoteView editor={editor} editable={false} theme="light" />;
};
