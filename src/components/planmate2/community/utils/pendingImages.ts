/**
 * 본문 이미지 업로드 유틸.
 *
 * 에디터에 이미지를 삽입하는 순간 서버에 올리면, 등록하지 않고 이탈한 draft의
 * 이미지가 MinIO에 고아로 남는다. 그렇다고 등록 시점에 전부 올리면 그 비용이
 * "등록" 버튼 한 번에 몰린다 — 요청 1건당 왕복이 0.5초대라 이미지 몇 장이면
 * 곧바로 수 초가 된다.
 *
 * 그래서 절충한다. 삽입 시엔 data: URL로 즉시 미리보기를 띄우면서 업로드는
 * 백그라운드로 시작해 두고(사용자가 글을 쓰는 동안 끝난다), 등록 시점에는
 * 그 결과를 받아 URL만 교체한다. 등록되지 못한 채 남은 업로드는
 * discard()로 지워 고아를 만들지 않는다.
 */

/** File → data: URL (에디터 임시 표시용) */
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
 * 삽입 시점에 미리 시작해 둔 업로드들을 들고 있는 장부.
 * 작성 화면 한 번(훅 인스턴스 하나)에 하나씩 만들어 쓴다.
 */
export interface PendingImageUploads {
  /** 삽입 직후 호출 — 백그라운드 업로드를 시작한다 (같은 data: URL은 한 번만) */
  start(dataUrl: string, file: File): void;
  /**
   * 등록 시점에 결과를 가져간다. 가져간 업로드는 장부에서 빠지므로
   * 이후 discard()의 정리 대상이 아니다 (등록 실패 시의 정리는 호출부가 맡는다).
   */
  take(dataUrl: string): Promise<string> | undefined;
  /**
   * 장부에 남은 업로드를 전부 지운다 — 삽입했다가 지운 이미지, 등록하지 않고
   * 이탈한 draft가 여기 해당한다. best-effort라 실패는 무시한다.
   */
  discard(): void;
}

export const createPendingImageUploads = (
  uploadImage: (file: File) => Promise<string>,
  deleteImage: (url: string) => Promise<void>,
): PendingImageUploads => {
  const started = new Map<string, Promise<string>>();

  return {
    start(dataUrl, file) {
      if (started.has(dataUrl)) return;
      const pending = uploadImage(file);
      // 여기서 실패해도 지금은 알릴 곳이 없다(사용자는 글을 쓰는 중이다).
      // 등록 시점에 재시도되므로 unhandled rejection만 막아둔다.
      pending.catch(() => {});
      started.set(dataUrl, pending);
    },

    take(dataUrl) {
      const pending = started.get(dataUrl);
      if (pending) started.delete(dataUrl);
      return pending;
    },

    discard() {
      const leftovers = [...started.values()];
      started.clear();
      leftovers.forEach((pending) => {
        pending.then((url) => deleteImage(url)).catch(() => {});
      });
    },
  };
};

/**
 * BlockNote 본문에서 아직 업로드되지 않은 data: 이미지를 MinIO에 업로드하고
 * 공개 URL로 교체한 새 블록 배열을 반환한다. (원본 블록은 건드리지 않음)
 * - 이미 http(s) URL인 이미지(수정 모드의 기존 이미지 등)는 그대로 둔다.
 * - 동일한 data: URL은 한 번만 업로드한다.
 * - pending이 있으면 삽입 시 시작해 둔 업로드를 재사용한다 (대개 이미 끝나 있다).
 * - uploadedUrls: 이번 등록에 딸린 공개 URL 목록 (등록 실패 시 정리용).
 */
export const resolveContentImages = async (
  blocks: any[],
  uploadImage: (file: File) => Promise<string>,
  pending?: PendingImageUploads,
): Promise<{ blocks: any[]; uploadedUrls: string[] }> => {
  const cloned = JSON.parse(JSON.stringify(blocks));
  const cache = new Map<string, Promise<string>>();
  const uploadedUrls: string[] = [];

  const upload = (dataUrl: string): Promise<string> => {
    let resolving = cache.get(dataUrl);
    if (!resolving) {
      const preStarted = pending?.take(dataUrl);
      const fresh = () => dataUrlToFile(dataUrl).then(uploadImage);
      // 미리 올려둔 게 있으면 그걸 쓰고, 그 업로드가 실패했었다면 지금 다시 올린다
      resolving = (preStarted ? preStarted.catch(fresh) : fresh()).then((url) => {
        uploadedUrls.push(url);
        return url;
      });
      cache.set(dataUrl, resolving);
    }
    return resolving;
  };

  // 이미지 노드를 먼저 모은 뒤 한꺼번에 올린다 — 하나씩 await 하면 N장이 N배 걸린다
  const targets: any[] = [];
  const collect = (nodes: any[]): void => {
    for (const node of nodes) {
      const url = node?.props?.url;
      if (node?.type === 'image' && typeof url === 'string' && url.startsWith('data:')) {
        targets.push(node);
      }
      if (Array.isArray(node?.children) && node.children.length > 0) {
        collect(node.children);
      }
    }
  };
  collect(cloned);

  await Promise.all(
    targets.map(async (node) => {
      node.props.url = await upload(node.props.url);
    }),
  );

  return { blocks: cloned, uploadedUrls };
};
