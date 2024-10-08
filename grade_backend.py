import sys
import os
from flask import Flask, jsonify, request
from PyPDF2 import PdfReader
import google.generativeai as genai
from flask_cors import CORS
import json
import re

genai.configure(api_key="AIzaSyBr3I10MLWq4XLZL9s5xNoBpIc5LUykFLA")

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

@app.route('/grade', methods=['POST'])
def grade_questions():
    if not request.is_json:
        return jsonify({"error": "Invalid JSON format"}), 400
    
    data = request.get_json()

    if not isinstance(data, list) or len(data) == 0:
        return jsonify({"error": "No questions provided or input format is incorrect"}), 400

    pdf_path = os.path.join(TMP_DIR, 'Intro_CN.pdf')

    try:
        reader = PdfReader(pdf_path)
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text()

        graded_results = []

        for qa in data:
            question = qa.get("question", "")
            answer = qa.get("answer", "")

            grade_response = grade(full_text, question, answer)

            # Parse the JSON response
            try:
                grade_json = json.loads(grade_response)
                grade_value = grade_json.get('grade', 'N/A')
                feedback = grade_json.get('feedback', 'N/A')
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract grade and feedback using string manipulation
                grade_match = re.search(r'"grade":\s*(\d+)', grade_response)
                feedback_match = re.search(r'"feedback":\s*"(.*?)"', grade_response, re.DOTALL)
                
                grade_value = grade_match.group(1) if grade_match else 'N/A'
                feedback = feedback_match.group(1) if feedback_match else 'N/A'

            qa['grade'] = grade_value
            qa['feedback'] = feedback
            graded_results.append(qa)

        return jsonify({"graded_results": graded_results}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def grade(context, question, answer):
    prompt = f"""
    You will be given a context for a question, the question itself, and an answer written by a student. Your task is to grade the answer on a scale of 0 to 5 and provide feedback.
    <context>{context}</context>
    <question>{question}</question>
    <answer>{answer}</answer>

    Output format:
    {{
    "grade": <grade>,
    "feedback": <feedback>
    }}
    """
    
    response = model.generate_content(prompt)
    print(response.text)  # This prints the correct JSON to the terminal

    return response.text


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)