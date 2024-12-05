from flask import Flask, jsonify

app = Flask(__name__)


@app.route('/')
def hello():
    return jsonify({'message': 'Hello World!'})


@app.post("/song/thumbnail")
def run():
    return jsonify({'message': 'Hello World!'})

app.run(port=7000)