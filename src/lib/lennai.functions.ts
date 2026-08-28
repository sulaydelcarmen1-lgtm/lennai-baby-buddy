import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { askLennAI, buildAdvancedRoutine } from "./lennai.server";

export const askLennAiFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ question: z.string().min(1).max(1000) }).parse(data))
  .handler(async ({ data, context }) =>
    askLennAI({ supabase: context.supabase, userId: context.userId }, data.question),
  );

export const advancedRoutineFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) =>
    buildAdvancedRoutine({ supabase: context.supabase, userId: context.userId }),
  );
