// app/api/web-socket/messages/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClien();
  const body = await req.json();

  const channelId = new URL(req.url).searchParams.get("channelId");
  const workspaceId = new URL(req.url).searchParams.get("workspaceId");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        content: body.content,
        channel_id: channelId,
        workspace_id: workspaceId,
        user_id: user.id,
      },
    ])
    .select();

  if (error) {
    console.error("Insert message error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: data[0] });
}
