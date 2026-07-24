/**
 * 본문 이미지 "등록 시 업로드" 유틸.
 *
 * 에디터에 이미지를 삽입하는 순간 서버에 올리면, 등록하지 않고 이탈한 draft의
 * 이미지가 MinIO에 고아로 남는다. 그래서 삽입 시엔 data: URL로만 들고 있다가,
 * 등록(제출) 시점에만 실제 업로드해 URL로 교체한다. (커버 이미지와 동일한 전략)
 */

/** File → data: URL (에디터 임시 표시용, 실제 업로드는 등록 시로 미룬다) */
export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('파일을 읽을 수 없습니다.'));
    reader.readAsDataURL(file);
  });

/** data: URL → File (등록 시 업로드용) */
const dataUrlToFile = async (dataUrl: string): Promise<File> => {
  const blob = await (await fetch(dataUrl)).blob();
  // image/svg+xml → svg 처럼 접미사를 정리한다
  const ext = (blob.type.split('/')[1] || 'png').split('+')[0];
  return new File([blob], `image.${ext}`, { type: blob.type });
};

/**
 * BlockNote 본문에서 아직 업로드되지 않은 data: 이미지를 MinIO에 업로드하고
 * 공개 URL로 교체한 새 블록 배열을 반환한다. (원본 블록은 건드리지 않음)
 * - 이미 http(s) URL인 이미지(수정 모드의 기존 이미지 등)는 그대로 둔다.
 * - 동일한 data: URL은 한 번만 업로드한다.
 * - uploadedUrls: 이번에 새로 올린 공개 URL 목록 (등록 실패 시 정리용).
 */
export const resolveContentImages = async (
  blocks: any[],
  uploadImage: (file: File) => Promise<string>,
): Promise<{ blocks: any[]; uploadedUrls: string[] }> => {
  const cloned = JSON.parse(JSON.stringify(blocks));
  const cache = new Map<string, Promise<string>>();
  const uploadedUrls: string[] = [];

  const upload = (dataUrl: string): Promise<string> => {
    let pending = cache.get(dataUrl);
    if (!pending) {
      pending = dataUrlToFile(dataUrl)
        .then(uploadImage)
        .then((url) => {
          uploadedUrls.push(url);
          return url;
        });
      cache.set(dataUrl, pending);
    }
    return pending;
  };

  const walk = async (nodes: any[]): Promise<void> => {
    for (const node of nodes) {
      const url = node?.props?.url;
      if (node?.type === 'image' && typeof url === 'string' && url.startsWith('data:')) {
        node.props.url = await upload(url);
      }
      if (Array.isArray(node?.children) && node.children.length > 0) {
        await walk(node.children);
      }
    }
  };

  await walk(cloned);
  return { blocks: cloned, uploadedUrls };
};
