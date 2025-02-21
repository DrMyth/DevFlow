import { db } from "@/app/db"; 
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  if (!user.emailAddresses[0]?.emailAddress) {
    return NextResponse.json({ error: "Email not found" }, { status: 400 });
  }

  await db.users.upsert({
    where: { email: user.emailAddresses[0]?.emailAddress },
    update: {
      name: user.firstName + " " + (user.lastName ?? ""),
      isPro: false,
      proSince: null,
    },
    create: {
      userId,
      email: user.emailAddresses[0]?.emailAddress,
      name: user.firstName + " " + (user.lastName ?? ""),
      isPro: false,
      proSince: null,
    },
  });

  return NextResponse.redirect(new URL("/editor", request.url));
}
