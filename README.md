# Lumen AI Chatbot

Lumen AI is a local AI chatbot web application built with Flask, Ollama, Llama 3.2, and MySQL.

It provides a ChatGPT-style conversational interface where users can interact with a locally running AI model. Conversations and messages are stored in MySQL so previous chats can be loaded even after refreshing the browser.

## Features

- 🤖 Local AI chatbot using Llama 3.2
- ⚡ Streaming AI responses
- 💬 Create new conversations
- 🧠 Conversation context and history
- 💾 Store conversations in MySQL
- 📂 Load previous conversations
- 🔄 Conversations persist after browser refresh
- 🗑️ Delete conversations
- 📝 Markdown-style AI response formatting
- 🔐 Environment variables for database credentials
- 🌐 Flask REST API
- 🖥️ Responsive ChatGPT-style interface
- 🔒 Runs locally on the user's machine

## Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Python
- Flask
- Flask REST API
- Requests

### AI

- Ollama
- Llama 3.2
- Local AI inference

### Database

- MySQL
- mysql-connector-python

### Development Tools

- Git
- GitHub
- VS Code

## System Architecture

```text
User
  ↓
Web Browser
  ↓
HTML + CSS + JavaScript
  ↓
Flask REST API
  ↓
Ollama API
  ↓
Llama 3.2
  ↓
Flask
  ↓
Web Browser

Conversation Data
        ↓
      MySQL