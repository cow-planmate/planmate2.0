import { useRef, useState } from 'react';
import { CheckCircle2, Flag, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { reportPost, type ReportReason } from '../api/communityApi';

const reasons: { value: ReportReason; label: string; description: string }[] = [
  { value: 'SPAM', label: '스팸 / 광고', description: '반복 게시글, 홍보 또는 광고성 내용' },
  { value: 'ABUSE', label: '욕설 / 비방 / 혐오', description: '다른 사람을 모욕하거나 혐오를 조장하는 내용' },
  { value: 'INAPPROPRIATE', label: '부적절한 콘텐츠', description: '음란물, 폭력적이거나 불법적인 내용' },
  { value: 'PRIVACY', label: '개인정보 침해', description: '동의 없이 공개된 개인정보' },
  { value: 'OTHER', label: '기타', description: '위 항목에 해당하지 않는 문제' },
];

export function ReportPostButton({ postId, feed = false }: { postId: number | string; feed?: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const submitLock = useRef(false);

  const handleOpen = () => {
    if (!localStorage.getItem('accessToken')) { alert('로그인 후 신고할 수 있습니다.'); return; }
    setReason(''); setDetails(''); setError(''); setSubmitted(false); setOpen(true);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reason || submitLock.current || (reason === 'OTHER' && !details.trim())) return;
    submitLock.current = true;
    setPending(true); setError('');
    try {
      await reportPost(postId, reason, details, feed);
      setSubmitted(true);
    } catch (e) { setError((e as Error).message || '신고 접수에 실패했습니다. 다시 시도해 주세요.'); }
    finally { setPending(false); submitLock.current = false; }
  };

  return <>
    <button onClick={handleOpen} className="flex min-h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-semibold text-[#737986] transition-colors hover:bg-red-50 hover:text-red-500">
      <Flag className="h-3.5 w-3.5" />신고하기
    </button>
    <Dialog.Root open={open} onOpenChange={next => { if (!submitLock.current) setOpen(next); }}>
      <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 max-h-[90vh] max-w-[460px] overflow-y-auto space-y-4 rounded-3xl border-0 bg-white p-7 text-[#16181d]">
        <Dialog.Close disabled={pending} aria-label="신고 창 닫기" className="absolute right-5 top-5 rounded-md p-1 text-[#737986] hover:bg-gray-100"><X className="h-4 w-4" /></Dialog.Close>
        <Dialog.Title className="flex items-center gap-2 text-xl font-bold"><Flag className="h-5 w-5 text-[#ef4c55]" />게시글 신고</Dialog.Title>
        <Dialog.Description className="text-sm leading-relaxed text-[#737986]">{submitted ? '신고가 접수되었습니다.' : '문제가 되는 내용을 알려주세요. 신고 사유를 선택해 주세요.'}</Dialog.Description>
        {submitted ? <div className="py-4 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[#1344FF]" />
          <p className="mb-6 text-sm text-[#687080]">신고 내용은 검토를 위해 저장되었습니다.</p>
          <button onClick={() => setOpen(false)} className="w-full rounded-xl bg-[#1344FF] py-3 text-sm font-bold text-white">확인</button>
        </div> : <form onSubmit={submit} className="space-y-5">
          <fieldset disabled={pending} className="space-y-2">
            <legend className="sr-only">신고 사유</legend>
            {reasons.map(item => <label key={item.value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${reason === item.value ? 'border-[#1344FF] bg-[#f3f6ff]' : 'border-[#e8eaee] hover:bg-[#f8f9fa]'}`}>
              <input type="radio" name="reportReason" value={item.value} checked={reason === item.value} onChange={() => setReason(item.value)} className="h-4 w-4 accent-[#1344FF]" />
              <span><span className="block text-sm font-semibold">{item.label}</span><span className="mt-0.5 block text-xs text-[#737986]">{item.description}</span></span>
            </label>)}
          </fieldset>
          <div>
            <label htmlFor="report-details" className="mb-2 block text-sm font-semibold">상세 내용 <span className="font-normal text-[#737986]">{reason === 'OTHER' ? '(필수)' : '(선택)'}</span></label>
            <textarea id="report-details" value={details} onChange={event => setDetails(event.target.value)} maxLength={1000} required={reason === 'OTHER'} disabled={pending} rows={3} placeholder="신고 내용을 자세히 알려주세요." className="w-full resize-none rounded-xl border border-[#e8eaee] p-3 text-sm outline-none focus:border-[#1344FF]" />
            <p className="text-right text-xs text-[#737986]">{details.length.toLocaleString()} / 1,000</p>
          </div>
          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button type="button" disabled={pending} onClick={() => setOpen(false)} className="flex-1 rounded-xl bg-[#f3f4f6] py-3 text-sm font-bold text-[#596170]">취소</button>
            <button type="submit" disabled={pending || !reason || (reason === 'OTHER' && !details.trim())} className="flex-1 rounded-xl bg-[#1344FF] py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{pending ? '접수 중…' : '신고 접수'}</button>
          </div>
        </form>}
      </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
}
