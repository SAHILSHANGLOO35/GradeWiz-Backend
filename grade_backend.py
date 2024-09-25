import sys
import os
from flask import Flask, jsonify, request
from PyPDF2 import PdfReader
from groq import Groq
from flask_cors import CORS


app = Flask(__name__)

CORS(app, origins=["*"])  # Replace "" with your frontend's origin

TMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tmp') 

def summarize_pdf(pdf_path, prompt):
    # Initialize Groq client
    client = Groq(
        api_key="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",
        # timeout=20.0,
    )

    # Open the PDF
    reader = PdfReader(pdf_path)

    full_text = ""
    for page in reader.pages:
        full_text += page.extract_text()

    # Create a prompt for summarization
    # prompt = f"You are an expert at creating quizzes from text. Create 10 detailed answer questions from the following content:\n\n{full_text}"

    prompt = f"{prompt}\n\n{full_text}"

    # Generate summary using Groq
    resp = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    return resp.choices[0].message.content

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