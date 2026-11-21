import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { AlignCenter, AlignLeft, AlignRight, Bold, ImagePlus, Italic, Link, List, ListOrdered, Quote, Redo2, Underline, Undo2 } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import './BlogEditor.css';

interface BlogEditorProps {
  editor: any;
}

export function BlogEditor({ editor }: BlogEditorProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const imageAnchor = useRef<any>(null);
  const [, setRevision] = useState(0);
  const [insertingImage, setInsertingImage] = useState(false);
  const [error, setError] = useState('');
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  useEffect(() => {
    const update = () => setRevision(value => value + 1);
    const offChange = editor.onChange(update);
    const offSelection = editor.onSelectionChange(update);
    return () => { offChange(); offSelection(); };
  }, [editor]);

  const styles = editor.getActiveStyles();
  const current = editor.getTextCursorPosition().block;
  const selected = () => editor.getSelection()?.blocks ?? [editor.getTextCursorPosition().block];
  const applyBlock = (type: string, props: Record<string, unknown> = {}) => {
    selected().filter((block: any) => Array.isArray(block.content)).forEach((block: any) => editor.updateBlock(block, { type, props }));
    editor.focus();
  };
  const toolbarButton = (label: string, icon: ReactNode, action: () => void, active = false) => (
    <button type="button" title={label} aria-label={label} aria-pressed={active} onMouseDown={event => event.preventDefault()} onClick={action} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${active ? 'bg-blue-50 text-[#1344FF]' : 'text-[#596170] hover:bg-[#f1f3f6]'}`}>
      {icon}
    </button>
  );
  const insertImages = async (files: FileList | null) => {
    if (!files?.length || insertingImage) return;
    setInsertingImage(true); setError('');
    try {
      let anchor = imageAnchor.current ?? editor.getTextCursorPosition().block;
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) throw new Error('이미지 파일을 선택해 주세요.');
        if (!editor.uploadFile) throw new Error('이미지를 불러올 수 없습니다.');
        const uploaded = await editor.uploadFile(file);
        const url = typeof uploaded === 'string' ? uploaded : uploaded.url;
        if (!url) throw new Error('이미지를 불러올 수 없습니다.');
        const blocks = editor.insertBlocks([{ type: 'image', props: { url, name: file.name } }, { type: 'paragraph', content: [] }], anchor, 'after');
        anchor = blocks[blocks.length - 1];
      }
      editor.setTextCursorPosition(anchor, 'end');
      editor.focus();
    } catch (e) { setError((e as Error).message); }
    finally { setInsertingImage(false); if (fileInput.current) fileInput.current.value = ''; }
  };
  const addLink = () => {
    const url = linkUrl.trim();
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) throw new Error();
    } catch { setError('올바른 링크 주소를 입력해 주세요.'); return; }
    editor.focus(); editor.createLink(url, linkText.trim() || url);
    setLinkOpen(false); setError('');
  };

  return <div className="blog-editor">
    <div role="toolbar" aria-label="본문 서식" className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-y border-[#eef0f3] bg-white/95 px-3 py-2 backdrop-blur sm:px-8">
      <select aria-label="문단 스타일" value={current.type === 'heading' ? `heading-${current.props.level}` : 'paragraph'} onChange={event => event.target.value.startsWith('heading-') ? applyBlock('heading', { level: Number(event.target.value.split('-')[1]) }) : applyBlock('paragraph')} className="mr-2 h-9 rounded-lg bg-transparent px-2 text-sm text-[#596170] outline-none focus:ring-2 focus:ring-blue-100">
        <option value="paragraph">본문</option><option value="heading-1">제목 1</option><option value="heading-2">제목 2</option><option value="heading-3">제목 3</option>
      </select>
      {toolbarButton('굵게', <Bold size={17} />, () => { editor.toggleStyles({ bold: true }); editor.focus(); }, !!styles.bold)}
      {toolbarButton('기울임', <Italic size={17} />, () => { editor.toggleStyles({ italic: true }); editor.focus(); }, !!styles.italic)}
      {toolbarButton('밑줄', <Underline size={17} />, () => { editor.toggleStyles({ underline: true }); editor.focus(); }, !!styles.underline)}
      <span aria-hidden className="mx-1 h-5 w-px bg-[#e8eaee]" />
      {toolbarButton('글머리 목록', <List size={18} />, () => applyBlock(current.type === 'bulletListItem' ? 'paragraph' : 'bulletListItem'), current.type === 'bulletListItem')}
      {toolbarButton('번호 목록', <ListOrdered size={18} />, () => applyBlock(current.type === 'numberedListItem' ? 'paragraph' : 'numberedListItem'), current.type === 'numberedListItem')}
      {toolbarButton('인용', <Quote size={17} />, () => applyBlock(current.type === 'quote' ? 'paragraph' : 'quote'), current.type === 'quote')}
      <span aria-hidden className="mx-1 h-5 w-px bg-[#e8eaee]" />
      {[{ value: 'left', label: '왼쪽 정렬', icon: <AlignLeft size={17} /> }, { value: 'center', label: '가운데 정렬', icon: <AlignCenter size={17} /> }, { value: 'right', label: '오른쪽 정렬', icon: <AlignRight size={17} /> }].map(item => <span key={item.value}>{toolbarButton(item.label, item.icon, () => { selected().filter((block: any) => 'textAlignment' in block.props).forEach((block: any) => editor.updateBlock(block, { props: { textAlignment: item.value } })); editor.focus(); }, current.props.textAlignment === item.value)}</span>)}
      <span aria-hidden className="mx-1 h-5 w-px bg-[#e8eaee]" />
      {toolbarButton('링크 삽입', <Link size={17} />, () => { setLinkText(editor.getSelectedText()); setLinkUrl(editor.getSelectedLinkUrl() ?? ''); setError(''); setLinkOpen(value => !value); }, linkOpen)}
      <button type="button" disabled={insertingImage} onMouseDown={event => event.preventDefault()} onClick={() => { imageAnchor.current = editor.getTextCursorPosition().block; fileInput.current?.click(); }} aria-label="사진 삽입" className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-[#596170] hover:bg-[#f1f3f6] disabled:opacity-40"><ImagePlus size={18} />{insertingImage ? '불러오는 중' : '사진'}</button>
      <div className="ml-auto flex">
        {toolbarButton('실행 취소', <Undo2 size={17} />, () => { editor.undo(); editor.focus(); })}
        {toolbarButton('다시 실행', <Redo2 size={17} />, () => { editor.redo(); editor.focus(); })}
      </div>
      <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" aria-label="본문 이미지 파일" onChange={event => void insertImages(event.target.files)} />
    </div>
    {linkOpen && <div className="flex flex-wrap items-center gap-2 border-b border-[#eef0f3] bg-[#f8f9fb] px-5 py-3 sm:px-9">
      <input aria-label="링크 표시 텍스트" value={linkText} onChange={event => setLinkText(event.target.value)} placeholder="표시할 텍스트" className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
      <input aria-label="링크 주소" value={linkUrl} onChange={event => setLinkUrl(event.target.value)} placeholder="https://" onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addLink(); } }} className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
      <button type="button" onClick={addLink} className="rounded-lg bg-[#1344FF] px-3 py-2 text-sm font-semibold text-white">적용</button>
      <button type="button" onClick={() => { setLinkOpen(false); setError(''); }} className="rounded-lg px-3 py-2 text-sm text-gray-500">취소</button>
    </div>}
    {error && <p role="alert" className="px-6 py-3 text-sm text-red-500">{error}</p>}
    <div className="blog-editor-body min-h-[480px] cursor-text px-6 py-7 sm:px-10 sm:py-9" onMouseDown={event => {
      const target = event.target as HTMLElement;
      if (target !== event.currentTarget && !target.classList.contains('bn-container')) return;
      event.preventDefault();
      const last = editor.document.at(-1);
      if (last) editor.setTextCursorPosition(last, 'end');
      editor.focus();
    }}>
      <BlockNoteView editor={editor} theme="light" formattingToolbar={false} slashMenu={false} sideMenu={false} />
    </div>
  </div>;
}
