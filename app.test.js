/**
 * @jest-environment jsdom
 */

function setupDOM() {
  document.body.innerHTML = `
    <form id="todo-form">
      <input type="text" id="todo-input" />
      <button type="submit">Add</button>
    </form>
    <ul id="todo-list"></ul>
    <p id="empty-state" class="empty-state">No todos yet. Add one above!</p>
  `;
}

function loadApp() {
  jest.resetModules();
  return require("./app");
}

beforeEach(() => {
  localStorage.clear();
  setupDOM();
});

describe("loadTodos", () => {
  test("returns empty array when localStorage is empty", () => {
    const { loadTodos } = loadApp();
    expect(loadTodos()).toEqual([]);
  });

  test("returns parsed todos from localStorage", () => {
    const todos = [{ id: "1", text: "Test", completed: false }];
    localStorage.setItem("todos", JSON.stringify(todos));
    const { loadTodos } = loadApp();
    expect(loadTodos()).toEqual(todos);
  });

  test("returns empty array when localStorage contains invalid JSON", () => {
    localStorage.setItem("todos", "not-json");
    const { loadTodos } = loadApp();
    expect(loadTodos()).toEqual([]);
  });
});

describe("saveTodos", () => {
  test("saves todos to localStorage", () => {
    const { saveTodos } = loadApp();
    const todos = [{ id: "1", text: "Buy milk", completed: false }];
    saveTodos(todos);
    expect(JSON.parse(localStorage.getItem("todos"))).toEqual(todos);
  });

  test("overwrites existing todos in localStorage", () => {
    localStorage.setItem("todos", JSON.stringify([{ id: "old" }]));
    const { saveTodos } = loadApp();
    const newTodos = [{ id: "new", text: "New", completed: true }];
    saveTodos(newTodos);
    expect(JSON.parse(localStorage.getItem("todos"))).toEqual(newTodos);
  });
});

describe("addTodo", () => {
  test("adds a new todo with correct structure", () => {
    const { addTodo, loadTodos } = loadApp();
    addTodo("Write tests");
    const todos = loadTodos();
    expect(todos).toHaveLength(1);
    expect(todos[0]).toMatchObject({ text: "Write tests", completed: false });
    expect(todos[0].id).toBeDefined();
  });

  test("appends to existing todos", () => {
    const { addTodo, loadTodos } = loadApp();
    addTodo("First");
    addTodo("Second");
    const todos = loadTodos();
    expect(todos).toHaveLength(2);
    expect(todos[0].text).toBe("First");
    expect(todos[1].text).toBe("Second");
  });

  test("renders the new todo in the DOM", () => {
    const { addTodo } = loadApp();
    addTodo("Visible todo");
    const list = document.getElementById("todo-list");
    expect(list.children).toHaveLength(1);
    expect(list.children[0].querySelector(".todo-text").textContent).toBe(
      "Visible todo"
    );
  });
});

describe("toggleTodo", () => {
  test("marks an incomplete todo as completed", () => {
    const { addTodo, toggleTodo, loadTodos } = loadApp();
    addTodo("Toggle me");
    const id = loadTodos()[0].id;
    toggleTodo(id);
    expect(loadTodos()[0].completed).toBe(true);
  });

  test("marks a completed todo as incomplete", () => {
    const { addTodo, toggleTodo, loadTodos } = loadApp();
    addTodo("Toggle twice");
    const id = loadTodos()[0].id;
    toggleTodo(id);
    toggleTodo(id);
    expect(loadTodos()[0].completed).toBe(false);
  });

  test("does nothing for a non-existent id", () => {
    const { addTodo, toggleTodo, loadTodos } = loadApp();
    addTodo("Stay");
    toggleTodo("nonexistent");
    expect(loadTodos()[0].completed).toBe(false);
  });
});

describe("deleteTodo", () => {
  test("removes a todo by id", () => {
    const { addTodo, deleteTodo, loadTodos } = loadApp();
    addTodo("Delete me");
    const id = loadTodos()[0].id;
    deleteTodo(id);
    expect(loadTodos()).toHaveLength(0);
  });

  test("only removes the targeted todo", () => {
    const todos = [
      { id: "1", text: "Keep", completed: false },
      { id: "2", text: "Remove", completed: false },
    ];
    localStorage.setItem("todos", JSON.stringify(todos));
    const { deleteTodo, loadTodos } = loadApp();
    deleteTodo("2");
    const remaining = loadTodos();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].text).toBe("Keep");
  });

  test("does nothing for a non-existent id", () => {
    const { addTodo, deleteTodo, loadTodos } = loadApp();
    addTodo("Stay");
    deleteTodo("nonexistent");
    expect(loadTodos()).toHaveLength(1);
  });
});

describe("createTodoElement", () => {
  test("creates an li with todo text", () => {
    const { createTodoElement } = loadApp();
    const el = createTodoElement({ id: "1", text: "Hello", completed: false });
    expect(el.tagName).toBe("LI");
    expect(el.querySelector(".todo-text").textContent).toBe("Hello");
  });

  test("adds completed class when todo is completed", () => {
    const { createTodoElement } = loadApp();
    const el = createTodoElement({ id: "1", text: "Done", completed: true });
    expect(el.classList.contains("completed")).toBe(true);
  });

  test("does not add completed class when todo is not completed", () => {
    const { createTodoElement } = loadApp();
    const el = createTodoElement({
      id: "1",
      text: "Not done",
      completed: false,
    });
    expect(el.classList.contains("completed")).toBe(false);
  });

  test("includes a delete button", () => {
    const { createTodoElement } = loadApp();
    const el = createTodoElement({ id: "1", text: "X", completed: false });
    const btn = el.querySelector(".delete-btn");
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe("✕");
  });

  test("sets data-id attribute", () => {
    const { createTodoElement } = loadApp();
    const el = createTodoElement({ id: "42", text: "X", completed: false });
    expect(el.dataset.id).toBe("42");
  });
});

describe("updateEmptyState", () => {
  test("hides empty state when there are todos", () => {
    const { updateEmptyState } = loadApp();
    updateEmptyState([{ id: "1" }]);
    const emptyState = document.getElementById("empty-state");
    expect(emptyState.classList.contains("hidden")).toBe(true);
  });

  test("shows empty state when there are no todos", () => {
    const { updateEmptyState } = loadApp();
    updateEmptyState([]);
    const emptyState = document.getElementById("empty-state");
    expect(emptyState.classList.contains("hidden")).toBe(false);
  });
});

describe("render", () => {
  test("renders all todos from localStorage", () => {
    const todos = [
      { id: "1", text: "First", completed: false },
      { id: "2", text: "Second", completed: true },
    ];
    localStorage.setItem("todos", JSON.stringify(todos));
    const { render } = loadApp();
    render();
    const list = document.getElementById("todo-list");
    expect(list.children).toHaveLength(2);
    expect(list.children[0].querySelector(".todo-text").textContent).toBe(
      "First"
    );
    expect(list.children[1].querySelector(".todo-text").textContent).toBe(
      "Second"
    );
  });

  test("clears list before re-rendering", () => {
    const { addTodo, render } = loadApp();
    addTodo("One");
    render();
    const list = document.getElementById("todo-list");
    expect(list.children).toHaveLength(1);
  });

  test("shows empty state when no todos exist", () => {
    const { render } = loadApp();
    render();
    const emptyState = document.getElementById("empty-state");
    expect(emptyState.classList.contains("hidden")).toBe(false);
  });
});

describe("form submission", () => {
  test("adds a todo on form submit", () => {
    const { loadTodos } = loadApp();
    const input = document.getElementById("todo-input");
    const form = document.getElementById("todo-form");
    input.value = "Submitted todo";
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    const todos = loadTodos();
    expect(todos).toHaveLength(1);
    expect(todos[0].text).toBe("Submitted todo");
  });

  test("clears input after submit", () => {
    loadApp();
    const input = document.getElementById("todo-input");
    const form = document.getElementById("todo-form");
    input.value = "Clear me";
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    expect(input.value).toBe("");
  });

  test("does not add a todo when input is empty", () => {
    const { loadTodos } = loadApp();
    const input = document.getElementById("todo-input");
    const form = document.getElementById("todo-form");
    input.value = "   ";
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    expect(loadTodos()).toHaveLength(0);
  });
});
