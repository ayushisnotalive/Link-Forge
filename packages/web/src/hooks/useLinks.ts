import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLinks, createLink, toggleLinkActive, deleteLink } from "../api/links";

export function useLinks() {
  return useQuery({ queryKey: ["links"], queryFn: fetchLinks });
}

export function useCreateLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLink,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["links"] }),
  });
}

export function useToggleLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleLinkActive(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["links"] }),
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLink,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["links"] }),
  });
}