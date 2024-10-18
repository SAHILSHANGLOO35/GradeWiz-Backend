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

CORS(app, origins=["*"])  

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
    # Get the prompt from the frontend
    prompt = request.form['prompt']
    
    
    # Ensure the prompt requests JSON format
    updated_prompt = f"{prompt} in JSON format"
    print(updated_prompt)

    # Save the uploaded PDF file temporarily (if applicable)
    pdf_path = os.path.join(TMP_DIR, 'Intro_CN.pdf')
    # pdf_file.save(pdf_path) # Uncomment if file upload functionality is added

    # Summarize the PDF
    try:
        summary = summarize_pdf(pdf_path, updated_prompt)
        print(summary)
        return jsonify({"Questions": summary}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/grade', methods=['POST'])
def grade_questions():
    print(request)
    if not request.is_json:
        return jsonify({"error": "Invalid JSON format"}), 400
    
    data = request.get_json()

    # Extract questions and grading level from the request
    questions = data.get("questions")
    grading_level = data.get("gradingLevel", "standard") 
    print(grading_level) # Default to "standard" if not provided

    if not isinstance(questions, list) or len(questions) == 0:
        return jsonify({"error": "No questions provided or input format is incorrect"}), 400

    pdf_path = os.path.join(TMP_DIR, 'Intro_CN.pdf')

    try:
        reader = PdfReader(pdf_path)
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text()

        graded_results = []

        for qa in questions:
            question = qa.get("question", "")
            answer = qa.get("answer", "")

            # Call the grade function with the context, question, answer, and grading level
            grade_response = grade(full_text, question, answer, grading_level)

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

def grade(context, question, answer, grading_level):
    # Adjust the prompt based on the grading level
    if grading_level == "hard":
        prompt = f"""
        You will be given a context for a question, the question itself, and an answer written by a student. Grade the answer on a scale of 0 to 5, being very strict in your assessment. Focus on precision, completeness, and adherence to the context. Penalize even minor inaccuracies or lack of details. For irrelevant or off-topic answers, give a grade of 0 without hesitation. Provide thorough feedback, detailing any mistakes and areas where the student can improve.

        <context>{context}</context>
        <question>{question}</question>
        <answer>{answer}</answer>

        Output format:
        {{
        "grade": <grade>,
        "feedback": <feedback>
        }}
        """
    elif grading_level == "medium":
        prompt = f"""
        You will be given a context for a question, the question itself, and an answer written by a student. Grade the answer on a scale of 0 to 5, focusing on a balance between accuracy, relevance, and effort. Consider minor mistakes as part of the overall effort. However, if the answer is irrelevant or completely off-topic, give a grade of 0. Provide constructive feedback that highlights both strengths and areas for improvement.

        <context>{context}</context>
        <question>{question}</question>
        <answer>{answer}</answer>

        Output format:
        {{
        "grade": <grade>,
        "feedback": <feedback>
        }}
        """
    elif grading_level == "lenient":
        prompt = f"""
        You will be given a context for a question, the question itself, and an answer written by a student. Grade the answer on a scale of 0 to 5, being lenient in your assessment. Focus on the student's effort and partial understanding, even if there are some inaccuracies. However, if the answer is irrelevant or completely off-topic, assign a grade of 0. Provide positive feedback, encouraging the student while suggesting areas for improvement.

        <context>{context}</context>
        <question>{question}</question>
        <answer>{answer}</answer>

        Output format:
        {{
        "grade": <grade>,
        "feedback": <feedback>
        }}
        """
    else:  # Default to "medium" grading level
        prompt = f"""
        You will be given a context for a question, the question itself, and an answer written by a student. Grade the answer on a scale of 0 to 5, focusing on a balance between accuracy, relevance, and effort. Consider minor mistakes as part of the overall effort. However, if the answer is irrelevant or completely off-topic, give a grade of 0. Provide constructive feedback that highlights both strengths and areas for improvement.

        <context>{context}</context>
        <question>{question}</question>
        <answer>{answer}</answer>

        Output format:
        {{
        "grade": <grade>,
        "feedback": <feedback>
        }}
        """
    print(prompt)
    response = model.generate_content(prompt)
    print(response.text)  # This prints the correct JSON to the terminal

    return response.text


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)