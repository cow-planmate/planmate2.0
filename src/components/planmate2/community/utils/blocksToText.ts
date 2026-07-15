/** BlockNote 블록에서 검색/미리보기용 평문 텍스트 추출 */
export const blocksToText = (blocks: any[]): string =>
  blocks
    .map((block) => {
      const inline = Array.isArray(block.content)
        ? block.content.map((c: any) => c?.text ?? '').join('')
        : '';
      const children = Array.isArray(block.children) ? blocksToText(block.children) : '';
      return [inline, children].filter(Boolean).join('\n');
    })
    .filter(Boolean)
    .join('\n');
