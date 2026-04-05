import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const siteUrl = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${siteUrl}${BASE_PATH}${next}`);
    } else {
      console.error("Auth callback error:", error.message);
    }
  }

  // 授权失败或没有 code 时，重定向回登录页并附带错误信息
  return NextResponse.redirect(`${siteUrl}${BASE_PATH}?message=Auth failed`);
}
