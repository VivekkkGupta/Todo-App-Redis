import client from "@/lib/redis";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
    try {
        const { todoId: id } = await params;

        if (!id) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }

        const todos = await client.json.get("todos");

        if (!todos || !todos[id]) {
            return NextResponse.json({ message: "Todo not found" }, { status: 404 });
        }

        // Delete the todo by removing the key from the object
        delete todos[id];

        // Save the updated object back to Redis
        await client.json.set("todos", "$", todos);

        return NextResponse.json({ message: "success", todos: todos }, { status: 200 });
    } catch (error) {
        console.error("Error in DELETE /api/todos", error);
        return NextResponse.json({ message: "failure", error: error.message }, { status: 500 });
    }
}