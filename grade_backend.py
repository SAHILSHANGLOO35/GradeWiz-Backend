import sys
import os
from flask import Flask, jsonify, request
from PyPDF2 import PdfReader
import google.generativeai as genai
from flask_cors import CORS

genai.configure(api_key=os.getenv("GEN_AI_API_KEY"))

app = Flask(__name__)

CORS(app, origins=["*"])  # Replace "" with your frontend's origin

TMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tmp') 

model = genai.GenerativeModel("gemini-1.5-flash")

def summarize_pdf(pdf_path, prompt):
    # Initialize Groq client

    # Open the PDF
    reader = PdfReader(pdf_path)

    full_text = ""
    for page in reader.pages:
        full_text += page.extract_text()

    # Create a prompt for summarization
    # prompt = f"You are an expert at creating quizzes from text. Create 10 detailed answer questions from the following content:\n\n{full_text}"

    prompt = f"{prompt}\n\n{full_text}"

    response = model.generate_content(prompt)
    
    return response.text

@app.route('/summarize', methods=['POST'])
def summarize():
    # if 'pdf' not in request.files:
    #     return jsonify({"error": "No PDF file provided"}), 400

    # pdf_file = request.files['pdf']
    prompt = request.form['prompt']
    print(prompt)

    # Save the uploaded PDF file temporarily
    pdf_path = os.path.join(TMP_DIR, 'Intro_CN.pdf')
    # pdf_file.save(pdf_path)

    # Summarize the PDF
    try:
        summary = summarize_pdf(pdf_path, prompt)
        print(summary)
        return jsonify({"Questions": summary}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)