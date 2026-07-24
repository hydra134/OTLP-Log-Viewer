"use client";

import { useCallback, useState } from "react";

export function useDisclosureSet(initialValues: string[] = []) {
  const [openIds, setOpenIds] = useState(() => new Set(initialValues));

  const isOpen = useCallback((id: string) => openIds.has(id), [openIds]);

  const toggle = useCallback((id: string) => {
    setOpenIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }, []);

  const closeAll = useCallback(() => setOpenIds(new Set()), []);

  return {
    openIds,
    isOpen,
    toggle,
    closeAll,
  };
}
