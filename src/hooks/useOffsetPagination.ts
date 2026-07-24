"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

const PAGE_PARAM = "page";

type UseOffsetPaginationParams<T> = {
  items: T[];
  limit: number;
};

export function useOffsetPagination<T>({ items, limit }: UseOffsetPaginationParams<T>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawPage = searchParams.get(PAGE_PARAM);
  const requestedPage = parsePage(rawPage);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.min(requestedPage, totalPages);
  const offset = totalItems === 0 ? 0 : (currentPage - 1) * limit;
  const rangeStart = totalItems === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + limit, totalItems);

  const pageItems = useMemo(() => items.slice(offset, offset + limit), [items, limit, offset]);

  const updatePageUrl = useCallback(
    (page: number, historyMode: "push" | "replace") => {
      const normalizedPage = normalizePage(page, totalPages);
      const params = new URLSearchParams(searchParams.toString());

      if (normalizedPage === 1) {
        params.delete(PAGE_PARAM);
      } else {
        params.set(PAGE_PARAM, String(normalizedPage));
      }

      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;

      if (historyMode === "push") {
        window.history.pushState(null, "", url);
      } else {
        window.history.replaceState(null, "", url);
      }
    },
    [pathname, searchParams, totalPages],
  );

  const resetPage = useCallback(() => updatePageUrl(1, "replace"), [updatePageUrl]);

  const setPage = useCallback((page: number) => updatePageUrl(page, "push"), [updatePageUrl]);

  useEffect(() => {
    const canonicalPage = currentPage === 1 ? null : String(currentPage);

    if (rawPage !== canonicalPage) {
      updatePageUrl(currentPage, "replace");
    }
  }, [currentPage, rawPage, updatePageUrl]);

  return {
    currentPage,
    offset,
    pageItems,
    rangeEnd,
    rangeStart,
    resetPage,
    setPage,
    totalItems,
    totalPages,
  };
}

function parsePage(value: string | null): number {
  if (!value || !/^\d+$/.test(value)) {
    return 1;
  }

  const page = Number(value);

  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function normalizePage(page: number, totalPages: number): number {
  return Math.min(Math.max(1, page), totalPages);
}
