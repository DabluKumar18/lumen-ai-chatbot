from flask import Flask, request, jsonify, render_template, Response, stream_with_context
import requests
import mysql.connector
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME")
}

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)


def create_conversation(title):
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        "INSERT INTO conversations (title) VALUES (%s)",
        (title,)
    )

    conversation_id = cursor.lastrowid

    db.commit()
    cursor.close()
    db.close()

    return conversation_id


def save_message(conversation_id, role, message):
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        """
        INSERT INTO messages (conversation_id, role, message)
        VALUES (%s, %s, %s)
        """,
        (conversation_id, role, message)
    )

    db.commit()
    cursor.close()
    db.close()

try:
    db = mysql.connector.connect(**DB_CONFIG)
    print("MySQL Connected Successfully!")
    db.close()
except mysql.connector.Error as error:
    print("MySQL Connection Failed:", error)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2"


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/conversations", methods=["GET"])
def get_conversations():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, title, created_at
        FROM conversations
        ORDER BY created_at DESC
    """)

    conversations = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(conversations)

@app.route("/api/conversations/<int:conversation_id>", methods=["DELETE"])
def delete_conversation(conversation_id):
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        "DELETE FROM messages WHERE conversation_id = %s",
        (conversation_id,)
    )

    cursor.execute(
        "DELETE FROM conversations WHERE id = %s",
        (conversation_id,)
    )

    db.commit()

    cursor.close()
    db.close()

    return jsonify({
        "message": "Conversation deleted successfully"
    })

@app.route("/api/conversations/<int:conversation_id>", methods=["GET"])
def get_conversation(conversation_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT id, role, message, created_at
        FROM messages
        WHERE conversation_id = %s
        ORDER BY created_at ASC, id ASC
        """,
        (conversation_id,)
    )

    messages = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(messages)


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()

    message = data.get("message", "").strip()
    history = data.get("history", [])

    if not message:
        return jsonify({"error": "Message is required"}), 400

    conversation_id = data.get("conversation_id")

    if not conversation_id:
        conversation_id = create_conversation(
        message[:50]
    )

    save_message(
        conversation_id,
        "user",
        message
)

    # Build conversation context
    conversation = ""

    for item in history[-10:]:
        role = item.get("role", "")
        text = item.get("text", "")

        if role == "user":
            conversation += f"User: {text}\n"

        elif role == "assistant":
            conversation += f"Assistant: {text}\n"

    prompt = f"""
You are Lumen AI, a helpful local AI assistant.


Conversation history:
{conversation}

Current user message:
{message}

Follow these response rules:

1. Understand what the user is asking before answering.

2. Match the answer length and detail to the user's question.

3. If the user asks a definition such as "What is Python?",
   give a clear definition and a brief overview.
   Do not give a long detailed explanation unless requested.

4. If the user asks "Explain Python",
   give a moderate explanation with the main concepts,
   important features, common uses, and a simple example when useful.

5. If the user asks "Explain Python in detail",
   provide a comprehensive structured explanation.
   Include definition, important concepts, features, examples,
   applications, relevant libraries or frameworks, advantages,
   limitations, and other useful details when relevant.

6. If the user asks for an example,
   provide a clear practical example with explanation.

7. If the user asks about frameworks, libraries, tools, or technologies,
   explain the relevant ones and what they are commonly used for.

8. For simple factual or personal questions, answer directly and briefly.
   Example:
   History: User: My name is Dablu.
   Question: What is my name?
   Answer: Your name is Dablu.

9. Use conversation history when it is relevant.
   Do not mention conversation history or explain how you remember it.

10. Use headings, numbered lists, bullet points, bold text,
    and code blocks when they improve readability.

11. Do not add unnecessary greetings, repetition, or filler.

12. Do not make every answer long. The user's question determines
    the appropriate level of detail.

Now answer the user's current message.
"""

    def generate():
        try:
            full_response = ""
            response = requests.post(
                OLLAMA_URL,
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "stream": True
                },
                stream=True,
                timeout=120
            )

            for line in response.iter_lines():
                if line:
                    data = json.loads(line)

                    if data.get("response"):
                        full_response += data["response"]

                yield line + b"\n"

            save_message(
            conversation_id,
            "assistant",
            full_response
        )

            yield json.dumps({
                "conversation_id": conversation_id,
                "done": True
            }).encode() + b"\n"

        except requests.exceptions.RequestException as error:
            yield (
                '{"error": "Could not connect to Ollama: '
                + str(error).replace('"', '\\"')
                + '"}\n'
            ).encode()

    return Response(
        stream_with_context(generate()),
        content_type="application/x-ndjson"
    )


if __name__ == "__main__":
    app.run(debug=True)