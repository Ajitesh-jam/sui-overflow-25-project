import { getEdgesOfNode } from "../connection/neo";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { label, where, edgeLabel, edgeWhere } = await req.json();

    console.log("label:", label);
    console.log("where:", where);
    console.log("edgeLabel:", edgeLabel);
    console.log("edgeWhere:", edgeWhere);

    const response = await getEdgesOfNode(
      label,
      where || [],
      edgeLabel,
      edgeWhere || []
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching edges:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
