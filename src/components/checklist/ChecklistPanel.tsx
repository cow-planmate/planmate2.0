import {
  Check,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  LockKeyhole,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  ChecklistScope,
  PlanChecklistItem,
  usePlanChecklists,
} from "./usePlanChecklists";

interface ChecklistPanelProps {
  planId: string;
  enabled?: boolean;
  initialScope?: ChecklistScope;
}

const scopeMeta = {
  shared: {
    label: "공동 준비",
    description: "여행 멤버 모두가 함께 관리해요.",
    Icon: Users,
  },
  personal: {
    label: "개인 준비",
    description: "나에게만 보이는 개인 목록이에요.",
    Icon: LockKeyhole,
  },
};

const EditableChecklistItem = ({
  item,
  index,
  total,
  disabled,
  onToggle,
  onUpdate,
  onDelete,
  onMove,
}: {
  item: PlanChecklistItem;
  index: number;
  total: number;
  disabled: boolean;
  onToggle: () => void;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
}) => {
  const [content, setContent] = useState(item.content);

  useEffect(() => setContent(item.content), [item.content]);

  const saveContent = () => {
    const nextContent = content.trim();
    if (!nextContent) {
      setContent(item.content);
      return;
    }
    if (nextContent !== item.content) onUpdate(nextContent);
  };

  return (
    <li className="group flex items-center gap-2 rounded-xl border border-transparent px-2 py-2 transition hover:border-gray-100 hover:bg-gray-50">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={item.isChecked ? "완료 취소" : "완료 처리"}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
          item.isChecked
            ? "border-[#1344FF] bg-[#1344FF] text-white"
            : "border-gray-300 bg-white text-transparent hover:border-[#1344FF]"
        }`}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </button>

      <input
        value={content}
        maxLength={255}
        disabled={disabled}
        onChange={(event) => setContent(event.target.value)}
        onBlur={saveContent}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") {
            setContent(item.content);
            event.currentTarget.blur();
          }
        }}
        aria-label="체크리스트 내용"
        className={`min-w-0 flex-1 border-0 bg-transparent text-sm font-medium outline-none ${
          item.isChecked ? "text-gray-400 line-through" : "text-gray-700"
        }`}
      />

      <div className="flex shrink-0 items-center opacity-60 transition group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={disabled || index === 0}
          aria-label="위로 이동"
          className="rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-20"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={disabled || index === total - 1}
          aria-label="아래로 이동"
          className="rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-20"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          aria-label="항목 삭제"
          className="ml-0.5 rounded-md p-1 text-gray-300 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
};

export const ChecklistPanel = ({
  planId,
  enabled = true,
  initialScope = "shared",
}: ChecklistPanelProps) => {
  const [scope, setScope] = useState<ChecklistScope>(initialScope);
  const [newItem, setNewItem] = useState("");
  const checklist = usePlanChecklists(planId, enabled);
  const items =
    scope === "shared" ? checklist.sharedItems : checklist.personalItems;
  const currentMeta = scopeMeta[scope];

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    const content = newItem.trim();
    if (!content) return;
    await checklist.addItem(scope, content);
    setNewItem("");
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[nextIndex]] = [
      reordered[nextIndex],
      reordered[index],
    ];
    checklist.reorderItems(
      scope,
      reordered.map((item) => item.itemId),
    );
  };

  if (!enabled) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
        <LockKeyhole className="mb-3 h-8 w-8 text-gray-300" />
        <p className="text-sm font-bold text-gray-700">일정을 먼저 저장해 주세요</p>
        <p className="mt-1 text-xs leading-5 text-gray-400">
          로그인 후 저장된 일정에서 여행 준비 목록을 사용할 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1.5">
        {(Object.keys(scopeMeta) as ChecklistScope[]).map((key) => {
          const { label, Icon } = scopeMeta[key];
          const count = checklist.counts[key];
          const active = scope === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setScope(key)}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                active
                  ? "bg-white text-[#1344FF] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              <span className="text-[11px] text-gray-400">
                {count.done}/{count.total}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 px-1 pb-3 pt-4">
        <currentMeta.Icon className="h-4 w-4 text-gray-400" />
        <p className="text-xs font-medium text-gray-500">
          {currentMeta.description}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {checklist.isLoading ? (
          <div className="flex min-h-40 items-center justify-center text-gray-400">
            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
            <span className="text-sm">준비 목록을 불러오는 중...</span>
          </div>
        ) : checklist.isError ? (
          <div className="flex min-h-40 flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-gray-600">
              준비 목록을 불러오지 못했어요.
            </p>
            <button
              type="button"
              onClick={() => checklist.refetch()}
              className="mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-[#1344FF] hover:bg-blue-50"
            >
              <RefreshCw className="h-3.5 w-3.5" /> 다시 시도
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-6 text-center">
            <currentMeta.Icon className="mb-2 h-7 w-7 text-gray-300" />
            <p className="text-sm font-bold text-gray-600">
              아직 준비 항목이 없어요
            </p>
            <p className="mt-1 text-xs text-gray-400">
              첫 번째 여행 준비를 추가해 보세요.
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map((item, index) => (
              <EditableChecklistItem
                key={item.itemId}
                item={item}
                index={index}
                total={items.length}
                disabled={checklist.isSaving}
                onToggle={() =>
                  checklist.toggleItem(scope, item.itemId, !item.isChecked)
                }
                onUpdate={(content) =>
                  checklist.updateItem(scope, item.itemId, content)
                }
                onDelete={() => checklist.deleteItem(scope, item.itemId)}
                onMove={(direction) => handleMove(index, direction)}
              />
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleAdd} className="mt-4 flex gap-2 border-t pt-4">
        <input
          value={newItem}
          maxLength={255}
          disabled={checklist.isSaving}
          onChange={(event) => setNewItem(event.target.value)}
          placeholder={`${currentMeta.label} 항목 추가`}
          aria-label={`${currentMeta.label} 항목 추가`}
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#1344FF] focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="submit"
          disabled={!newItem.trim() || checklist.isSaving}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1344FF] text-white transition hover:bg-[#0e35cc] disabled:cursor-not-allowed disabled:bg-gray-200"
          aria-label="항목 추가"
        >
          {checklist.isSaving ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
};
