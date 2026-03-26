import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import refereeApi from "./refereeApi";

const KEYS = {
  referees: ["referees"],
  requests: (status) => ["referee-requests", status || "all"],
};

export function useReferees() {
  return useQuery({
    queryKey: KEYS.referees,
    queryFn: refereeApi.fetchReferees,
  });
}

export function useRequests(filterStatus) {
  return useQuery({
    queryKey: KEYS.requests(filterStatus),
    queryFn: () => refereeApi.fetchRequests(filterStatus || undefined),
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: refereeApi.createRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee-requests"] });
    },
  });
}

export function useUpdateRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: refereeApi.updateRequestStatus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee-requests"] });
      qc.invalidateQueries({ queryKey: KEYS.referees });
    },
  });
}
