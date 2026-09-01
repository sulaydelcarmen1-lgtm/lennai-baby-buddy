import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Profile = {
  id: string;
  mom_name: string | null;
  baby_name: string | null;
  baby_birth_date: string | null;
  feeding_type: string | null;
  preferences: string[] | null;
  onboarded: boolean;
  is_premium: boolean;
};

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as Profile;
      const { data: created, error: insertError } = await supabase
        .from("profiles")
        .upsert({ id: user.id }, { onConflict: "id" })
        .select("*")
        .single();
      if (insertError) throw insertError;
      return created as Profile;
    },
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<Profile>) => {
      const { error } = await supabase
        .from("profiles")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", user?.id] }),
  });
}

export type BabyLog = {
  id: string;
  kind: string;
  started_at: string;
  duration_minutes: number | null;
  amount_ml: number | null;
  detail: string | null;
  note: string | null;
};

export function useLogs(days = 7) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["logs", user?.id, days],
    enabled: !!user,
    queryFn: async (): Promise<BabyLog[]> => {
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data, error } = await supabase
        .from("baby_logs")
        .select("*")
        .gte("started_at", since)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BabyLog[];
    },
  });
}

export function useAddLog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: {
      kind: string;
      duration_minutes?: number | null;
      amount_ml?: number | null;
      detail?: string | null;
      note?: string | null;
    }) => {
      const { error } = await supabase.from("baby_logs").insert({ ...log, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["logs"] }),
  });
}

export function useDeleteLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("baby_logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["logs"] }),
  });
}

export function useMilestones() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["milestones", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("milestones").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useToggleMilestone() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, achieved }: { slug: string; achieved: boolean }) => {
      if (achieved) {
        const { error } = await supabase
          .from("milestones")
          .upsert(
            { user_id: user!.id, slug, achieved_at: new Date().toISOString().slice(0, 10) },
            { onConflict: "user_id,slug" },
          );
        if (error) throw error;
      } else {
        const { error } = await supabase.from("milestones").delete().eq("slug", slug);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["milestones"] }),
  });
}

export function useMemories() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["memories", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("happened_on", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddMemory() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { title: string; body?: string; happened_on?: string }) => {
      const { error } = await supabase.from("memories").insert({ ...values, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["memories"] }),
  });
}

export function useMoods() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["moods", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mood_checkins")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(14);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddMood() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { mood: string; note?: string }) => {
      const { error } = await supabase.from("mood_checkins").insert({ ...values, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["moods"] }),
  });
}
