import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const body = await req.json();
    const db = await getDb();

    const doc = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("plans").insertOne(doc);

    return NextResponse.json({ ok: true, id: result.insertedId.toString() });
  } catch (err) {
    return NextResponse.json({ error: "Failed to save plan" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const plans = await db
      .collection("plans")
      .find({}, { projection: { groupName: 1, selectedBook: 1, meetup: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const normalized = plans.map((p) => ({
      ...p,
      _id: p._id.toString(),
    }));

    return NextResponse.json({ plans: normalized });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load plans" }, { status: 500 });
  }
}