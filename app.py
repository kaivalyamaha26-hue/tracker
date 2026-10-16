"""
Personal Fitness Tracker - Flask Backend Entry Point
Can be run locally with:
  pip install -r requirements.txt
  python app.py
"""
import os
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, supports_credentials=True)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'online', 'service': 'Personal Fitness Tracker Flask Backend', 'version': '1.0.0'})

# Notice: All REST endpoints are fully supported by the primary full-stack engine 
# in server.ts and can also be wired to MySQL via PyMySQL/Flask-MySQLdb.

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Flask Fitness Server starting on http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
