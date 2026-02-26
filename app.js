const STORAGE_KEY = "todos";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function updateEmptyState(todos) {
  emptyState.classList.toggle("hidden", todos.length > 0);
}

function createTodoElement(todo) {
  const li = document.createElement("li");
  if (todo.completed) li.classList.add("completed");
  li.dataset.id = todo.id;

  const span = document.createElement("span");
  span.className = "todo-text";
  span.textContent = todo.text;
  span.addEventListener("click", () => toggleTodo(todo.id));

  const btn = document.createElement("button");
  btn.className = "delete-btn";
  btn.textContent = "✕";
  btn.title = "Delete";
  btn.addEventListener("click", () => deleteTodo(todo.id));

  li.append(span, btn);
  return li;
}

function render() {
  const todos = loadTodos();
  list.innerHTML = "";
  todos.forEach((todo) => list.appendChild(createTodoElement(todo)));
  updateEmptyState(todos);
}

function addTodo(text) {
  const todos = loadTodos();
  todos.push({ id: Date.now().toString(), text, completed: false });
  saveTodos(todos);
  render();
}

function toggleTodo(id) {
  const todos = loadTodos();
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
  saveTodos(todos);
  render();
}

function deleteTodo(id) {
  const todos = loadTodos().filter((t) => t.id !== id);
  saveTodos(todos);
  render();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text) {
    addTodo(text);
    input.value = "";
    input.focus();
  }
});

render();

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    loadTodos,
    saveTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    createTodoElement,
    updateEmptyState,
    render,
    STORAGE_KEY,
  };
}
