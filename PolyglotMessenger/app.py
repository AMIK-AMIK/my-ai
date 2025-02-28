import os
import json
import logging
from flask import Flask, render_template, request, send_from_directory
from flask_socketio import SocketIO, emit
import openai

logging.basicConfig(level=logging.DEBUG)
app = Flask(__name__, static_url_path='/static', static_folder='static')
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize OpenAI client
openai.api_key = os.environ.get("OPENAI_API_KEY")

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('send_message')
def handle_message(data):
    try:
        user_message = data['message']
        chat_id = data.get('chatId')

        # Send "typing" indicator
        emit('ai_typing', {'chatId': chat_id})

        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",  # Using a valid model
            messages=[
                {"role": "system", "content": "You are AMIK AI Assistant, a helpful and knowledgeable AI."},
                {"role": "user", "content": user_message}
            ],
            max_tokens=500
        )

        ai_response = response.choices[0].message.content

        # Send AI response back to client
        emit('ai_response', {
            'message': ai_response,
            'chatId': chat_id,
            'timestamp': data.get('timestamp')
        })

    except Exception as e:
        logging.error(f"Error in handle_message: {str(e)}")
        emit('ai_error', {
            'error': 'Sorry, there was an error processing your request.',
            'chatId': chat_id if 'chat_id' in locals() else None
        })

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)