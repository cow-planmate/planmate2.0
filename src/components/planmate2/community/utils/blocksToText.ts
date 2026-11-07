/** BlockNote 블록에서 검색/미리보기용 평문 텍스트 추출 */
const inlineToText = (content: any[]): string => content.map((item) => {
  if (item?.type === 'link' && Array.isArray(item.content)) return inlineToText(item.content);
  return item?.text ?? '';
}).join('');

export const blocksToText = (blocks: any[]): string =>
  blocks
    .map((block) => {
      const inline = Array.isArray(block.content) ? inlineToText(block.content) : '';
      const children = Array.isArray(block.children) ? blocksToText(block.children) : '';
      return [inline, children].filter(Boolean).join('\n');
    })
    .filter(Boolean)
    .join('\n');
