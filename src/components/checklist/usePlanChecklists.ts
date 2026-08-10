import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../../hooks/useApiClient";
import { ErrorToast } from "../common/Toast";

export type ChecklistScope = "shared" | "personal";

export interface PlanChecklistItem {
  itemId: number;
  content: string;
  isChecked: boolean;
  sortOrder: number;
}

const checklistKeys = {
  all: (planId: string) => ["plan-checklists", planId] as const,
  scope: (planId: string, scope: ChecklistScope) =>
    [...checklistKeys.all(planId), scope] as const,
};

const getScopePath = (scope: ChecklistScope) =>
  scope === "personal" ? "/checklist/me" : "/checklist";

const requestChecklistApi = async <T,>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  url: string,
  request: unknown,
  apiCall: () => Promise<T>,
) => {
  console.log(`[Checklist API] ${method} 요청`, {
    url,
    ...(request === undefined ? {} : { request }),
  });

  try {
    const response = await apiCall();
    console.log(`[Checklist API] ${method} 응답`, { url, response });
    return response;
  } catch (error) {
    console.error(`[Checklist API] ${method} 오류`, { url, error });
    throw error;
  }
};

const normalizeItems = (response: unknown): PlanChecklistItem[] => {
  const value = response as { items?: PlanChecklistItem[] } | PlanChecklistItem[];
  const items = Array.isArray(value) ? value : value?.items;

  return [...(items ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
};

export const usePlanChecklists = (planId?: string | null, enabled = true) => {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { get, post, patch, del } = useApiClient();
  const queryClient = useQueryClient();
  const canLoad = Boolean(planId && enabled);

  const sharedQuery = useQuery({
    queryKey: checklistKeys.scope(planId ?? "", "shared"),
    queryFn: () => {
      const url = `${BASE_URL}/api/plan/${planId}${getScopePath("shared")}`;
      return requestChecklistApi("GET", url, undefined, () => get(url)).then(
        normalizeItems,
      );
    },
    enabled: canLoad,
  });

  const personalQuery = useQuery({
    queryKey: checklistKeys.scope(planId ?? "", "personal"),
    queryFn: () => {
      const url = `${BASE_URL}/api/plan/${planId}${getScopePath("personal")}`;
      return requestChecklistApi("GET", url, undefined, () => get(url)).then(
        normalizeItems,
      );
    },
    enabled: canLoad,
  });

  const invalidateScope = (scope: ChecklistScope) =>
    queryClient.invalidateQueries({
      queryKey: checklistKeys.scope(planId ?? "", scope),
    });

  const mutation = useMutation({
    mutationFn: async (action: {
      type: "add" | "toggle" | "update" | "delete" | "reorder";
      scope: ChecklistScope;
      itemId?: number;
      content?: string;
      isChecked?: boolean;
      itemIds?: number[];
    }) => {
      if (!planId) throw new Error("일정 정보가 없습니다.");

      const basePath = `${BASE_URL}/api/plan/${planId}${getScopePath(action.scope)}`;

      switch (action.type) {
        case "add": {
          const request = { content: action.content };
          return requestChecklistApi("POST", basePath, request, () =>
            post(basePath, request),
          );
        }
        case "toggle": {
          const url = `${basePath}/${action.itemId}/check`;
          const request = { isChecked: action.isChecked };
          return requestChecklistApi("PATCH", url, request, () =>
            patch(url, request),
          );
        }
        case "update": {
          const url = `${basePath}/${action.itemId}`;
          const request = { content: action.content };
          return requestChecklistApi("PATCH", url, request, () =>
            patch(url, request),
          );
        }
        case "delete": {
          const url = `${basePath}/${action.itemId}`;
          return requestChecklistApi("DELETE", url, undefined, () => del(url));
        }
        case "reorder": {
          const url = `${basePath}/order`;
          const request = { itemIds: action.itemIds };
          return requestChecklistApi("PATCH", url, request, () =>
            patch(url, request),
          );
        }
      }
    },
    onMutate: async (variables) => {
      if (variables.type !== "reorder" || !variables.itemIds) return;
      const queryKey = checklistKeys.scope(planId ?? "", variables.scope);
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<PlanChecklistItem[]>(queryKey);
      const itemById = new Map(
        (previousItems ?? []).map((item) => [item.itemId, item]),
      );
      const reorderedItems = variables.itemIds
        .map((itemId, index) => {
          const item = itemById.get(itemId);
          return item ? { ...item, sortOrder: index } : undefined;
        })
        .filter((item): item is PlanChecklistItem => Boolean(item));
      queryClient.setQueryData(queryKey, reorderedItems);
      return { previousItems, queryKey };
    },
    onSuccess: (_, variables) => invalidateScope(variables.scope),
    onError: (error: Error, _variables, context) => {
      if (context?.previousItems && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousItems);
      }
      ErrorToast(error.message || "체크리스트를 저장하지 못했습니다.");
    },
  });

  const counts = useMemo(
    () => ({
      shared: {
        done: (sharedQuery.data ?? []).filter((item) => item.isChecked).length,
        total: (sharedQuery.data ?? []).length,
      },
      personal: {
        done: (personalQuery.data ?? []).filter((item) => item.isChecked).length,
        total: (personalQuery.data ?? []).length,
      },
    }),
    [personalQuery.data, sharedQuery.data],
  );

  return {
    sharedItems: sharedQuery.data ?? [],
    personalItems: personalQuery.data ?? [],
    counts,
    isLoading: sharedQuery.isLoading || personalQuery.isLoading,
    isError: sharedQuery.isError || personalQuery.isError,
    isSaving: mutation.isPending,
    refetch: () => Promise.all([sharedQuery.refetch(), personalQuery.refetch()]),
    addItem: (scope: ChecklistScope, content: string) =>
      mutation.mutateAsync({ type: "add", scope, content }),
    toggleItem: (
      scope: ChecklistScope,
      itemId: number,
      isChecked: boolean,
    ) => mutation.mutateAsync({ type: "toggle", scope, itemId, isChecked }),
    updateItem: (scope: ChecklistScope, itemId: number, content: string) =>
      mutation.mutateAsync({ type: "update", scope, itemId, content }),
    deleteItem: (scope: ChecklistScope, itemId: number) =>
      mutation.mutateAsync({ type: "delete", scope, itemId }),
    reorderItems: (scope: ChecklistScope, itemIds: number[]) =>
      mutation.mutateAsync({ type: "reorder", scope, itemIds }),
  };
};
