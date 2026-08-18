import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useMemo, useRef } from 'react';

interface PostContentViewerProps {
  content: unknown; // BlockNote 블록 JSON
  contentText?: string;
  /** 상세 카드처럼 부모의 콘텐츠 시작선에 맞출 때 BlockNote 기본 좌우 패딩을 제거한다 */
  flush?: boolean;
}

/** 저장된 BlockNote 블록을 읽기 전용으로 렌더링. 블록 파싱 실패 시 평문 fallback. */
export const PostContentViewer = ({ content, contentText, flush = false }: PostContentViewerProps) => {
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

  return <BlockNoteReadOnly blocks={blocks} flush={flush} />;
};

const BlockNoteReadOnly = ({ blocks, flush }: { blocks: any[]; flush: boolean }) => {
  const editor = useCreateBlockNote({ initialContent: blocks });
  const containerRef = useRef<HTMLDivElement>(null);

  // initialContent는 에디터 생성 시점에만 적용되므로, 게시글 수정 후 갱신된 블록을 반영한다
  useEffect(() => {
    editor.replaceBlocks(editor.document, blocks);
  }, [blocks, editor]);

  useEffect(() => {
    if (!flush) return;
    const editorElement = containerRef.current?.querySelector<HTMLElement>('.bn-editor');
    editorElement?.style.setProperty('padding-inline', '0', 'important');
  }, [flush, editor]);

  return (
    <div ref={containerRef}>
      <BlockNoteView editor={editor} editable={false} theme="light" />
    </div>
  );
};
