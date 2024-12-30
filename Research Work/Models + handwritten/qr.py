from flask import Flask, send_file, jsonify, request
from fpdf import FPDF
import qrcode
import os
import threading
import firebase_admin
from firebase_admin import credentials, storage
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import jwt
import uuid
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
import requests
from paddleocr import PaddleOCR
import ast
from datetime import timedelta, datetime


app = Flask(__name__)

from twilio.rest import Client
# account_sid = 'AC5186c244c2b5714b805579d93cac2e60'
# auth_token = '[AuthToken]'
# client = Client(account_sid, auth_token)
# message = client.messages.create(
#   messaging_service_sid='MG32347ee8d526135b563960d9d8e07e95',
#   body='Ahoy 👋',
#   to='+919104299676'
# )
# print(message.sid)


# Firebase initialization
cred = credentials.Certificate('medical-healthcare-chatbot-firebase-adminsdk-jwfa3-6c8b3fe2f4.json')
firebase_admin.initialize_app(cred, {
    'storageBucket': 'medical-healthcare-chatbot.appspot.com'
})
bucket = storage.bucket()

# MongoDB initialization
uri = "mongodb+srv://aspurao03:SEProject%40123@cluster0.crjrgrn.mongodb.net/healthcare_chatbot?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client['healthcare_chatbot']
prescriptions_collection = db['prescriptions']

from paddleocr import PaddleOCR
import google.generativeai as genai
import os

ocr = PaddleOCR(
    det_model_dir="./saved_models/en/det",
    rec_model_dir="./saved_models/en/rec",
    cls_model_dir="./saved_models/en/cls",
    use_angle_cls=True,
    lang='en'
)

##TO-DO
# JWT secret key
SECRET_KEY = 'Bhenafdlfa'


# PDF generation class
class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Medical Prescription', align='C', ln=1)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def add_prescription(self, patient_name, doctor_name, medicines):
        self.set_font('Arial', '', 12)
        self.cell(0, 10, f'Patient Name: {patient_name}', ln=1)
        self.cell(0, 10, f'Doctor: {doctor_name}', ln=1)
        self.ln(10)
        self.set_font('Arial', 'I', 12)
        self.cell(0, 10, 'Medicines:', ln=1)
        self.ln(5)
        self.set_font('Arial', '', 12)
        for medicine in medicines:
            self.cell(0, 10, f'- {medicine}', ln=1)



# ### to do adwait will change this
# # JWT middleware
# def token_required(f):
#     def decorator(*args, **kwargs):
#         token = request.headers.get('x-auth-token')
#         if not token:
#             return jsonify({'error': 'Token is missing!'}), 401

#         try:
#             decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
#             user_role = decoded_token.get('role')
#             if user_role != 'pharmacist':
#                 return jsonify({'error': 'Access forbidden: only pharmacists allowed'}), 403
#         except jwt.ExpiredSignatureError:
#             return jsonify({'error': 'Token has expired'}), 401
#         except jwt.InvalidTokenError:
#             return jsonify({'error': 'Invalid token'}), 401

#         return f(*args, **kwargs)

#     return decorator




def generate_pdf(prescription_id, medicines, patient_name, doctor_name):
    pdf = PDF()
    pdf.add_page()
    
    patient_name = patient_name # You can add dynamic patient data
    doctor_name = doctor_name  # You can add dynamic doctor data
    
    # Add prescription details to the PDF
    pdf.add_prescription(patient_name, doctor_name, medicines)

    # Save PDF locally and upload to Firebase
    pdf_file_path = f'medical_prescription_{prescription_id}.pdf'
    pdf.output(pdf_file_path)

    # Upload to Firebase Storage
    blob = bucket.blob(f'Prescription/{prescription_id}/pdf/medical_prescription.pdf')
    blob.upload_from_filename(pdf_file_path)

    # Store prescription details in MongoDB
    prescriptions_collection.insert_one({
        'prescription_id': prescription_id,
        'firebase_path': f'Prescription/{prescription_id}/pdf/medical_prescription.pdf',
        'patient_name': patient_name,
        'doctor_name': doctor_name
    })

    return pdf_file_path


# Generate QR Code
def generate_qr_code(prescription_id):
    # Redirect to React application with the prescription ID
    access_url = f'https://localhost:5173/pharmacist/view-prescription/{prescription_id}'
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(access_url)
    qr.make(fit=True)

    qr_file_path = 'prescription_qr.png'
    qr_img = qr.make_image(fill='black', back_color='white')
    qr_img.save(qr_file_path)

    # Upload the QR code to Firebase
    blob = bucket.blob(f'Prescription/{prescription_id}/qr/prescription_qr.png')
    blob.upload_from_filename(qr_file_path)

    # Get the public URL of the uploaded QR code
    expiration = datetime.utcnow() + timedelta(hours=24)  # Valid for 1 hour
    download_url = blob.generate_signed_url(expiration=expiration)
    
    account_sid = 'AC5186c244c2b5714b805579d93cac2e60'
    auth_token = 'b7c2f8bea5063f603a942e3c2907ea71'
    client = Client(account_sid, auth_token)
    message = client.messages.create(
      messaging_service_sid='MG32347ee8d526135b563960d9d8e07e95',
      body=f'Here is your prescription QR code: {download_url}',
      to='+919104299676'
    )

    return qr_file_path


@app.route('/prescription/<prescription_id>', methods=['GET'])
def access_prescription(prescription_id):
    prescription = prescriptions_collection.find_one({'prescription_id': prescription_id})
    if not prescription:
        return jsonify({'error': 'Prescription not found'}), 404

    firebase_path = prescription['firebase_path']
    blob = bucket.blob(firebase_path)
    download_url = blob.public_url  # 1-hour validity
    print(download_url)
    return jsonify({
        'download_url': download_url
    })


@app.route('/generate_prescription', methods=['GET'])
def generate_prescription():
    prescription_id = str(uuid.uuid4())
    generate_pdf(prescription_id)
    qr_file_path = generate_qr_code(prescription_id)
    return send_file(qr_file_path, as_attachment=True)


def remove_qr_code():
    qr_file_path = 'prescription_qr.png'
    if os.path.exists(qr_file_path):
        os.remove(qr_file_path)
        print(f'Removed expired QR Code: "{qr_file_path}"')


# def schedule_qr_code_removal():
#     threading.Timer(300, remove_qr_code).start()  # 300 seconds = 5 minutes




# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload_handwritten_notes', methods=['POST'])
def upload_handwritten_notes():
    # Get the URL and other details from the frontend
    data = request.json
    file_url = data.get('url')
    patient_name = data.get('patient_name')
    doctor_name = data.get('doctor_name')
    
    # Validate the required inputs
    if not file_url:
        return jsonify({'error': 'No URL provided'}), 400
    if not patient_name:
        return jsonify({'error': 'No patient name provided'}), 400
    if not doctor_name:
        return jsonify({'error': 'No doctor name provided'}), 400

    # Fetch the file from the URL
    try:
        response = requests.get(file_url)
        response.raise_for_status()  # Raise an error for bad responses
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Error fetching file from URL: {str(e)}'}), 400

    # Save the file temporarily
    content_type = response.headers.get('Content-Type')
    file_extension = content_type.split('/')[-1]  # Extract file extension from content type
    if file_extension not in ALLOWED_EXTENSIONS:
        return jsonify({'error': 'Invalid file type'}), 400

    filename = f'{uuid.uuid4().hex}.{file_extension}'
    file_path = f'uploads/{filename}'
    with open(file_path, 'wb') as f:
        f.write(response.content)

    # Determine file type and process accordingly
    if file_extension in {'png', 'jpg', 'jpeg'}:
        # Process image using OCR
        full_text = process_image(file_path)
    elif file_extension == 'pdf':
        # Extract text from PDF
        full_text = process_pdf(file_path)
    elif file_extension == 'txt':
        # Read the text file
        with open(file_path, 'r') as f:
            full_text = f.read()

    if not full_text:
        return jsonify({'error': 'No readable content found in the file'}), 400

    # Set your API key as an environment variable
    os.environ["API_KEY"] = "AIzaSyAXEu4sPwPIW8B1A114yU-Iza-wlQ_I18Q"

    # Configure the API key
    genai.configure(api_key=os.environ["API_KEY"])

    # Create a model instance
    model = genai.GenerativeModel("gemini-1.5-flash")

    # Extract the list of medicines using AI model
    prompt = f"Extract medicine from this text: {full_text} and give me a python list only with medicine names."
    response = model.generate_content(prompt)
    # change this
    text = response.text
    start = text.find("[")
    end = text.rfind("]") + 1
    list_str = text[start:end]
    medicines = ast.literal_eval(list_str) # Assuming each medicine is on a new line

    if not medicines:
        return jsonify({'error': 'No medicines found in the text'}), 400

    # Generate the prescription PDF
    prescription_id = str(uuid.uuid4())
    generate_pdf(prescription_id, medicines, patient_name, doctor_name)

    # Generate the QR code
    qr_file_path = generate_qr_code(prescription_id)

    # Clean up the temporary file
    os.remove(file_path)

    ## add in current medicine 


    # Return the QR code file to the frontend
    return send_file(qr_file_path, as_attachment=True)



def process_pdf(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text()
        return full_text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""



def process_image(img_path):
    # Initialize PaddleOCR
    ocr = PaddleOCR(use_angle_cls=True, lang='en')

    # Perform OCR on the image
    try:
        result = ocr.ocr(img_path, cls=True)
        # Combine text from all recognized regions
        full_text = ' '.join([line[1][0] for line in result[0]])
        return full_text
    except Exception as e:
        print(f"Error during OCR processing: {e}")
        return ""


if __name__ == '__main__':
    # schedule_qr_code_removal()
    app.run(debug=True)
