import sys
import os
from flask import Flask, jsonify, request
from PyPDF2 import PdfReader
import google.generativeai as genai
from flask_cors import CORS
import json

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
    # Check if the incoming request contains valid JSON
    if not request.is_json:
        return jsonify({"error": "Invalid JSON format"}), 400
    
    # Read the JSON payload from the request
    data = request.get_json()

    # Check if the data is a non-empty list
    if not isinstance(data, list) or len(data) == 0:
        return jsonify({"error": "No questions provided or input format is incorrect"}), 400

    # Path to the uploaded PDF (adjust the path accordingly)
    pdf_path = os.path.join(TMP_DIR, 'Intro_CN.pdf')

    try:
        # Extract text from the PDF
        reader = PdfReader(pdf_path)
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text()

        # List to store the graded results
        graded_results = []

        # Loop through each question-answer object in the data
        for qa in data:
            question = qa.get("question", "")
            answer = qa.get("answer", "")

            # Call the `grade` function to get the grade for this question-answer pair
            grade_response = grade(full_text, question, answer)

            # Check and handle empty or invalid JSON responses from `grade`
            try:
                grade_value = json.loads(grade_response).get('grade', 'N/A')
            except json.JSONDecodeError:
                grade_value = 'N/A'

            # Append the graded result to the list
            graded_result = {"question": question, "answer": answer, "grade": grade_value}
            graded_results.append(graded_result)

        # Return the graded results as a JSON response
        return jsonify({"graded_results": graded_results}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def grade(context, question, answer):
    # Create a prompt for grading the answer based on the given context
    prompt = f"""
    You will be given a context for a question, the question itself, and an answer written by a student. Your task is to grade the answer on a scale of 1 to 5.
    <context>{context}</context>
    <question>{question}</question>
    <answer>{answer}</answer>

    Output format:
    {{
    'grade': <grade>
    }}
    """
    
    # Call the model to get a response for the grading
    response = model.generate_content(prompt)
    print(response.text)
    
    # Check if the response is empty or invalid
    if not response or not response.text.strip():
        return '{"grade": "N/A"}'  # Return default grade if response is empty

    try:
        # Return the raw response text
        return response.text
    except Exception as e:
        return '{"grade": "N/A"}'  # Return default grade if any error occurs




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)