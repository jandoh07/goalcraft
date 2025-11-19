import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, source, medium, campaign } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const apiKey = process.env.CONVERTKIT_API_KEY!;
    const tagId = process.env.CONVERTKIT_TAG_ID!;

    // Step 1 — Create subscriber
    const createRes = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers: {
        "X-Kit-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        fields: { source, medium, campaign },
      }),
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      return NextResponse.json(
        { error: createData.message || "Failed to create subscriber" },
        { status: 400 }
      );
    }

    const subscriberId = createData.subscriber?.id;
    if (!subscriberId) {
      return NextResponse.json(
        { error: "Subscriber ID missing from ConvertKit" },
        { status: 500 }
      );
    }

    // Step 2 — Add a tag
    const tagRes = await fetch(
      `https://api.kit.com/v4/tags/${tagId}/subscribers/${subscriberId}`,
      {
        method: "POST",
        headers: {
          "X-Kit-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: "{}",
      }
    );

    const tagData = await tagRes.json();

    if (!tagRes.ok) {
      return NextResponse.json(
        { error: tagData.message || "Failed to apply tag" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Subscription successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
