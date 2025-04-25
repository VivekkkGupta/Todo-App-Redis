"use client"

import { useEffect, useState } from "react"
import { Edit, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Header from "@/components/header"
import axios from "axios"

export default function TodoApp() {

  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState("")

  const addTodo = async () => {
    if (newTodo.trim() === "") return
    try {
      const res = await axios.post("/api/todos", {
        "title": `${newTodo}`,
      })
      const data = res.data
      if (res.status !== 200) {
        throw new Error("Failed to add todo")
      }
      setTodos(data.todos)
      setNewTodo("")
    } catch (error) {
      console.error("Error adding todo:", error)
    }
  }

  const deleteTodo = async (id) => {
    if (!id) return
    if(id === editingId) {
      setEditingId(null)
      setEditText("")
    }
    try {
      const res = await axios.delete(`/api/todos/${id}`)
      const data = res.data
      if (res.status !== 200) {
        throw new Error("Failed to delete todo")
      }
      setTodos(data.todos)
    } catch (error) {
      console.error("Error deleting todo:", error)
    }
  }

  const toggleComplete = async (id) => {

    try {
      let res = ""
      if (todos[id].completed === "true") {
        res = await axios.put(`/api/todos`, { "id": id, "title": todos[id].title, "completed": "false" })
      } else {
        res = await axios.put(`/api/todos`, { "id": id, "title": todos[id].title, "completed": "true" })
      }
      if (!res) {
        console.error("Error toggling todo:", error)
        return
      }
      const data = res.data
      if (res.status !== 200) {
        throw new Error("Failed to toggle todo")
      }
      setTodos(data.todos)
    }
    catch (error) {
      console.error("Error toggling todo:", error)
    }
  }

  const startEdit = (todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  const saveEdit = async () => {
    if (editText.trim() === "") return
    // If the text hasn't changed, just exit
    if (todos[editingId].text === editText) {
      setEditingId(null)
      return
    }

    try {
      const res = await axios.put(`/api/todos`, { "id": editingId, "title": editText, "completed": todos[editingId].completed });
      const data = res.data
      if (res.status !== 200) {
        throw new Error("Failed to save todo")
      }
      setTodos(data.todos)
      setEditText("")
      setEditingId(null)
    } catch (error) {
      console.error("Error saving todo:", error)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addTodo()
    }
  }

  const fetchTodos = async () => {
    try {
      const response = await axios.get("/api/todos");
      const data = response.data
      if (response.status !== 200) {
        throw new Error("Failed to fetch todos")
      }
      setTodos(data.todos)
    } catch (error) {
      console.error("Error fetching todos:", error)
    }
  }

  useEffect(() => {
    fetchTodos()
    console.log("Todos fetched:", todos)
  }, [])


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container flex-1 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center gap-2">
            <Input
              type="text"
              placeholder="Add a new todo..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={addTodo} className="bg-primary hover:bg-primary/90">
              Add
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead className="w-[150px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!todos ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No todos yet. Add one above!
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {Object.keys(todos).map((key) => {
                      const todo = todos[key]; // Access the todo object using the key
                      return (
                        <TableRow key={todo.id} className={todo.completed ? "bg-muted/50" : ""}>
                          <TableCell className={`${todo.completed === "true" ? "line-through text-muted-foreground" : ""}`}>
                            {editingId === todo.id ? (
                              <Input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onBlur={saveEdit}
                                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                                autoFocus
                              />
                            ) : (
                              todo.title
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => toggleComplete(todo.id)}
                                className="h-8 w-8"
                              >
                                <Check className="h-4 w-4" />
                                <span className="sr-only">Mark as {todo.completed === "true" ? "incomplete" : "complete"}</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => startEdit(todo)}
                                disabled={editingId === todo.id}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => deleteTodo(todo.id)}
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
