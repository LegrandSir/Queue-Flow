# backend/run.py
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # This allows React to access your API

@app.route('/')
def home():
    return {"message": "Queue Flow API is running!"}

if __name__ == '__main__':
    app.run(debug=True, port=5000)