from flask import Flask, jsonify, request
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))
PORT = os.getenv("PORT")
app = Flask(__name__)

@app.route('/')
def home():
    return jsonify(message="Hello, Flask backend is running!")

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify(data={"name": "Shantanu", "role": "Developer"})

@app.route('/api/echo', methods=['POST'])
def echo():
    content = request.json
    return jsonify(received=content)

if __name__ == '__main__':
    port = int(os.getenv("PORT", PORT))  # default to 5000 if not set
    app.run(debug=True, port=port)
