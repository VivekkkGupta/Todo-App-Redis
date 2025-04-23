import client from "@/lib/redis";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET(req, res) {
    try {
        const todos = await client.json.get("todos");
        if (!todos) {
            return NextResponse.json({ message: "No todos found" }, { status: 404 });
        }
        return NextResponse.json({ message: "success", todos: todos }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "failure", error: error }, { status: 500 });
    }
}

export async function POST(req, res) {
    try {
        const body = await req.json();
        const { title } = body;

        if (!title) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }

        const newTodo = {
            id: uuidv4(),
            title: title,
            completed: false,
        };

        // Fetch existing todos (object) from Redis
        let todos = await client.json.get("todos");

        // If no todos exist, initialize as an empty object
        if (!todos) {
            todos = {};
        }

        // Add the new todo to the object with id as the key
        todos[newTodo.id] = newTodo;

        // Save the updated object back to Redis
        await client.json.set("todos", "$", todos);

        return NextResponse.json({ message: "success", todos: todos }, { status: 200 });
    } catch (error) {
        console.error("Error in POST /api/todos", error);
        return NextResponse.json({ message: "failure", error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, res) {
    try {
        const body = await req.json();
        const { id } = body;

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

export async function PUT(req, res) {
    try {
        const body = await req.json();
        const { id, title, completed } = body;

        if (!id || (!title && completed === undefined)) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }

        const todos = await client.json.get("todos");

        if (!todos || !todos[id]) {
            return NextResponse.json({ message: "Todo not found" }, { status: 404 });
        }

        // Update the todo object
        const updatedTodo = {
            ...todos[id],
            ...(title && { title }),
            ...(completed !== undefined && { completed }),
        };

        // Update the todos object
        todos[id] = updatedTodo;

        // Save the updated object back to Redis
        await client.json.set("todos", "$", todos);

        return NextResponse.json({ message: "success", todos: todos }, { status: 200 });
    } catch (error) {
        console.error("Error in PUT /api/todos", error);
        return NextResponse.json({ message: "failure", error: error.message }, { status: 500 });
    }
}