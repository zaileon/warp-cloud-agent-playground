# Todo App

A simple, dependency-free todo app built with vanilla HTML, CSS, and JavaScript.

## Features

- Add, complete, and delete todos
- Persistent storage via `localStorage`
- Responsive design

## Usage

Open `index.html` in a browser — no build step or server required.

### Interactions

- **Add a todo**: Type in the input field and press Enter or click "Add".
- **Complete a todo**: Click on the todo text to toggle its completed state (shown with a strikethrough).
- **Delete a todo**: Click the ✕ button next to a todo to remove it.

Todos are saved automatically to `localStorage` and persist across page reloads.

## Project Structure

- `index.html` — App markup and entry point
- `style.css` — Styling and layout
- `app.js` — Application logic (add, toggle, delete, render, localStorage)
