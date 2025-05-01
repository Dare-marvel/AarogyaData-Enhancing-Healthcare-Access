from flask import Flask, request, jsonify
import pandas as pd
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk
import pickle
import logging
from flask_cors import CORS
from sklearn.ensemble import RandomForestClassifier
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from PIL import Image
from urllib.request import urlopen
import firebase_admin
from firebase_admin import credentials, storage
from io import BytesIO
from urllib.request import urlopen
from PIL import Image
import numpy as np
from keras.preprocessing import image
from flask import Flask, request, jsonify
import logging
import requests
import numpy as np
import tensorflow as tf
from PIL import Image
import base64

from twilio.rest import Client
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
import pyshorteners

import google.generativeai as genai
import os
from dotenv import load_dotenv
from keras.models import load_model

# Load environment variables from the .env file
load_dotenv()


# Ensure the required NLTK resources are downloaded
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('stopwords')
nltk.download('wordnet')

# Firebase initialization
FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS")
FIREBASE_BUCKET = os.getenv("FIREBASE_BUCKET")

cred = credentials.Certificate(FIREBASE_CREDENTIALS)
firebase_admin.initialize_app(cred, {'storageBucket': FIREBASE_BUCKET})
bucket = storage.bucket()

# MongoDB initialization
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
db = client['healthcare_chatbot']
prescriptions_collection = db['prescriptions']


ocr = PaddleOCR(
    det_model_dir="./saved_models/en/det",
    rec_model_dir="./saved_models/en/rec",
    cls_model_dir="./saved_models/en/cls",
    use_angle_cls=True,
    lang='en'
)


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Enable logging for debugging
logging.basicConfig(level=logging.DEBUG)


# Load your CSV and initialize the model as before
smoothed_df = pd.read_csv("Dataset/Final_csv.csv")
smoothed_df.set_index('risk level', inplace=True)


class RiskAssessmentModel:
    def __init__(self, smoothed_df):
        # Initialize the lemmatizer
        self.lemmatizer = WordNetLemmatizer()
        # Initialize the list of stop words
        self.stop_words = set(stopwords.words('english'))
        # Load the smoothed DataFrame
        self.smoothed_df = smoothed_df

    # Preprocess user input symptoms (with tokenization, lemmatization, and stop word removal)
    def preprocess_input(self, user_input):
        symptoms = [symptom.strip() for symptom in user_input.split(',')]
        symptoms_list = []
        for symptom in symptoms:
            tokens = word_tokenize(symptom.lower())
            # Lemmatize and remove stop words
            symp = [self.lemmatizer.lemmatize(
                token) for token in tokens if token.isalpha() and token not in self.stop_words]
            # Combine tokens back into a single string
            symptoms_list.append(" ".join(symp))
        return symptoms_list

    # Function to calculate risk level probabilities based on user symptoms
    def calculate_risk_probabilities(self, symptoms_list):
        risk_probs = {}

        for risk_level in self.smoothed_df.index:
            risk_prob = 1  # Start with 1 because we will multiply probabilities

            # For each symptom, multiply the respective probability from the smoothed_df
            for symptom in symptoms_list:
                if symptom in self.smoothed_df.columns:
                    # Multiply by the symptom's probability
                    risk_prob *= self.smoothed_df.loc[risk_level, symptom]
                else:
                    risk_prob *= 0.01  # Assume a very low probability for unrecognized symptoms

            risk_probs[risk_level] = risk_prob

        return risk_probs

    # Function to predict the risk level with the highest probability
    def predict_risk_level(self, user_input):
        symptoms_list = self.preprocess_input(user_input)
        risk_probs = self.calculate_risk_probabilities(symptoms_list)

        # Find the risk level with the maximum probability
        max_risk_level = max(risk_probs, key=risk_probs.get)
        return max_risk_level, risk_probs[max_risk_level]


# Initialize the model
model = RiskAssessmentModel(smoothed_df)


#####################################   Risk Assessemnt Model    ##################################################

# Define a route for predicting the risk level based on symptoms
@app.route('/predict', methods=['POST'])
def predict_risk():
    try:
        # Log request
        logging.debug(f"Request received: {request.data}")

        # Get the JSON request which contains symptoms
        data = request.get_json()

        # Extract symptoms from the request
        symptoms = data.get('symptoms', None)
        if symptoms is None:
            logging.error("No symptoms provided")
            return jsonify({'error': 'No symptoms provided'}), 400

        # Predict the risk level using the model
        risk_level, probability = model.predict_risk_level(symptoms)

        # Log the result
        logging.debug(
            f"Predicted risk level: {risk_level}, Probability: {probability}")

        # Return the result as a JSON response
        return jsonify({'risk_level': risk_level, 'probability': probability}), 200
    except Exception as e:
        # Log stack trace
        logging.error(f"Error occurred: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

# # Load the saved Random Forest model
# with open('doctor_prediction_model.pkl', 'rb') as file:
#     doctor_model = pickle.load(file)


# Read the dataset
data = pd.read_csv("Dataset/dataset.csv")

# Split symptoms into separate columns
symptoms_list = data['symptoms'].str.split(',')
symptom_columns = list(
    set(symptom for sublist in symptoms_list for symptom in sublist))
data = pd.concat([data, pd.DataFrame(columns=list(symptom_columns))], axis=1)

# Update columns with value 1 if symptom is present
for index, symptoms in enumerate(symptoms_list):
    data.loc[index, symptoms] = 1

# Drop the original symptoms column
data.drop('symptoms', axis=1, inplace=True)
# Update symptom columns fillna
data[symptom_columns] = data[symptom_columns].fillna(0)
# Prepare data for modeling
X = data.drop(['disease', 'cures', 'doctor', 'risk level'], axis=1)
y = data['doctor']

# # Split the data into training and testing sets
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize and train the Random Forest classifier
doctor_model = RandomForestClassifier(n_estimators=100, random_state=42)
doctor_model.fit(X, y)

# Predict the doctor to visit for the test set
y_pred = doctor_model.predict(X)


#####################################   Recommend Doctor    ##################################################

@app.route('/predict_doctor', methods=['POST'])
def predict_doctor():
    # Get the symptoms from the request
    input_symptoms = request.json.get('symptoms', '').split(',')

    # Prepare the input data with the same structure as the training data
    input_data = pd.DataFrame(columns=X.columns)
    valid_symptoms = [
        symptom for symptom in input_symptoms if symptom in X.columns]

    if not valid_symptoms:
        # If no valid symptoms, predict "family doctor"
        return jsonify({'predicted_doctor': 'family doctor'})

    for symptom in valid_symptoms:
        input_data.loc[0, symptom] = 1

    # Ensure input_data has the same columns in the same order as the model
    input_data = input_data.reindex(columns=X.columns, fill_value=0)

    # Predict the doctor based on the input symptoms
    predicted_doctor = doctor_model.predict(input_data)

    # Return the predicted doctor as a JSON response
    return jsonify({'predicted_doctor': predicted_doctor[0]})

#####################################   Kitney Stone      ##################################################


@app.route('/predict_kidney_image', methods=['POST'])
def predict_kidney_image():
    try:
        # Get the JSON request which contains the image URL
        data = request.get_json()
        image_url = data.get('image_url', None)

        if not image_url:
            logging.error("No image URL provided")
            return jsonify({'error': 'No image URL provided'}), 400

        # Load the pre-trained model
        # Make sure to import any custom layers or components your model uses
        loaded_model = tf.keras.models.load_model(
            "models/kidney_stone_detection_model.h5")

        # Download the image from the provided URL
        response = requests.get(image_url)  # Get image as bytes
        if response.status_code != 200:
            logging.error("Failed to download image from U∫RL")
            return jsonify({'error': 'Failed to download image'}), 400

        # Open the image using PIL from the byte stream
        img = Image.open(BytesIO(response.content))

        # Preprocess the image
        # Adjust size as per the model's input requirement
        img = img.resize((150, 150))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        img_array = img_array / 255.0  # Normalize pixel values to [0, 1]

        # Predict the class
        predictions = loaded_model.predict(img_array)
        # Get the index of the highest probabilit∫
        predicted_class = np.argmax(predictions, axis=1)[0]
        predic_class = {1: 'Stone', 0: 'Normal'}
        # Return the predicted class
        return jsonify({'predicted_class': predic_class[int(predicted_class)]}), 200

    except Exception as e:
        # Log stack trace
        logging.error(f"Error occurred: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500


#####################################    Brain Tumor      ##################################################


@app.route('/predict_brain_tumor', methods=['POST'])
def predict_brain_tumor():
    try:
        # Get the JSON request which contains the image URL
        data = request.get_json()
        image_url = data.get('image_url', None)

        if not image_url:
            logging.error("No image URL provided")
            return jsonify({'error': 'No image URL provided'}), 400

        # Load the pre-trained Brain Tumor model
        brain_tumor_model = load_model('models/Brain_Tumor_Model.h5')

        # Download the image from the provided URL
        response = requests.get(image_url)
        if response.status_code != 200:
            logging.error("Failed to download image from URL")
            return jsonify({'error': 'Failed to download image'}), 400

        # Open the image using PIL from the byte stream
        img = Image.open(BytesIO(response.content))

        # Preprocess the image
        img = img.resize((224, 224))  # Resize image to the model's input size
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        img_array = img_array / 255.0  # Normalize pixel values to [0, 1]

        # Predict the brain tumor category
        predictions = brain_tumor_model.predict(img_array)
        index = np.argmax(predictions[0])
        outputs = ['No Tumor', 'Tumor']
        predicted_label = outputs[index]

        # Log the prediction
        logging.debug(f"Prediction: {predicted_label}")

        # Return the prediction as a JSON response
        return jsonify({'predicted_class': predicted_label}), 200

    except Exception as e:
        # Log stack trace
        logging.error(f"Error occurred: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500


#####################################  Skin cancer   ##################################################

@app.route('/predict_skin_cancer', methods=['POST'])
def predict_skin_cancer():
    try:
        # Get the JSON request which contains the image URL
        data = request.get_json()
        image_url = data.get('image_url', None)

        if not image_url:
            logging.error("No image URL provided")
            return jsonify({'error': 'No image URL provided'}), 400

        # Load the pre-trained Skin Cancer model
        skin_cancer_model = load_model('models/skin_cancer_model.h5')

        # Download the image from the provided URL
        response = requests.get(image_url)
        if response.status_code != 200:
            logging.error("Failed to download image from URL")
            return jsonify({'error': 'Failed to download image'}), 400

        # Open the image using PIL from the byte stream
        img = Image.open(BytesIO(response.content))

        # Preprocess the image
        img = img.resize((224, 224))  # Resize image to the model's input size
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        img_array = img_array / 255.0  # Normalize pixel values to [0, 1]

        # Predict the skin cancer category
        predictions = skin_cancer_model.predict(img_array)
        index = np.argmax(predictions[0])
        outputs = {
            'akiec': 'Actinic Keratoses and Intraepithelial Carcinoma (pre-cancerous)',
            'bcc': 'Basal Cell Carcinoma (a common type of skin cancer)',
            'bkl': 'Benign Keratosis (non-cancerous lesion)',
            'df': 'Dermatofibroma (benign skin lesion)',
            'nv': 'Melanocytic Nevus (a common mole)',
            'vasc': 'Vascular Lesions (non-cancerous lesions of blood vessels)',
            'mel': 'Melanoma (most dangerous type of skin cancer)'
        }
        predicted_label = list(outputs.values())[index]
        predicted_key = list(outputs.keys())[index]

        # Log the prediction
        logging.debug(f"Prediction: {predicted_key} - {predicted_label}")

        # Return the prediction as a JSON response
        return jsonify({
            'predicted_class': predicted_key,
            'description': predicted_label
        }), 200

    except Exception as e:
        # Log stack trace
        logging.error(f"Error occurred: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500


################################# PDF Creation Code #############################################

class PDF(FPDF):
    def header(self):
        # Add the logo image
        # Adjust size to fit neatly
        self.image('aarogya-data-logo.png', 10, 8, 20)
        # Add title
        self.set_font('Arial', 'B', 14)
        self.cell(0, 10, 'Medical Prescription', align='C', ln=1)
        # Add current date and time
        self.set_font('Arial', 'I', 10)
        current_time = datetime.now().strftime('%d-%m-%Y %H:%M:%S')
        self.cell(0, 10, f'Date: {current_time}', align='R', ln=1)
        self.ln(10)  # Add spacing after the header

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(
            0, 10, f'Page {self.page_no()} | Generated on {datetime.now().strftime("%d-%m-%Y %H:%M:%S")}', 0, 0, 'C')

    def add_prescription(self, patient_name, doctor_name, medicines):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, f'Patient Name: {patient_name}', ln=1, border=1)
        self.cell(0, 10, f'Doctor Name: {doctor_name}', ln=1, border=1)
        self.ln(10)  # Add spacing between sections

        # Add medicines section
        self.set_font('Arial', 'I', 12)
        self.cell(0, 10, 'Medicines:', ln=1)
        self.ln(5)
        self.set_font('Arial', '', 12)
        for i, medicine in enumerate(medicines, 1):  # Enumerate for numbering
            self.cell(10)  # Indent
            self.cell(0, 10, f'{i}. {medicine}', ln=1)


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

    patient_name = patient_name  # You can add dynamic patient data
    doctor_name = doctor_name  # You can add dynamic doctor data

    # Add prescription details to the PDF
    pdf.add_prescription(patient_name, doctor_name, medicines)

    # Save PDF locally and upload to Firebase
    pdf_file_path = f'uploads/medical_prescription_{prescription_id}.pdf'
    pdf.output(pdf_file_path)

    print(prescription_id, pdf_file_path)

    # Upload to Firebase Storage
    blob = bucket.blob(
        f'Prescription/{prescription_id}/pdf/medical_prescription_{prescription_id}.pdf')
    blob.upload_from_filename(pdf_file_path)
    blob.make_public()

    token = blob.generate_signed_url(expiration=36000).split(
        "?")[1]  # Extract the token from the signed URL
    file_path = f"Prescription/{prescription_id}/pdf/medical_prescription_{prescription_id}.pdf".replace('/', '%2F')
    firebase_storage_url = (
    f"https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/"
    f"{file_path}?alt=media&{token}"
    )

    # Store prescription details in MongoDB
    prescriptions_collection.insert_one({
        'prescription_id': prescription_id,
        'firebase_path': firebase_storage_url,
        'file_name': f"medical_prescription_{prescription_id}.pdf",
        'patient_name': patient_name,
        'doctor_name': doctor_name
    })

    return pdf_file_path


# Generate QR Code
def generate_qr_code(prescription_id):
    # Redirect to React application with the prescription ID
    access_url = f'http://localhost:5173/pharmacist/view-prescription/{prescription_id}'
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(access_url)
    qr.make(fit=True)

    qr_file_path = 'uploads/prescription_qr.png'
    qr_img = qr.make_image(fill='black', back_color='white')
    qr_img.save(qr_file_path)

    # Upload the QR code to Firebase
    blob = bucket.blob(
        f'Prescription/{prescription_id}/qr/prescription_qr.png')
    blob.upload_from_filename(qr_file_path)

    # Get the public URL of the uploaded QR code
    expiration = datetime.utcnow() + timedelta(hours=24)  # Valid for 1 hour
    download_url = blob.generate_signed_url(expiration=expiration)
    shortener = pyshorteners.Shortener()
    short_url = shortener.tinyurl.short(download_url)

    account_sid = os.getenv("ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    phone_number = os.getenv("TWILIO_PHONE_NUMBER")
    whatsapp_from = os.getenv("TWILIO_WHATSAPP_FROM")


    # Send SMS and WhatsApp messages using Twilio
    client = Client(account_sid, auth_token)
    sms_message = client.messages.create(
        from_=phone_number,
        body=f'Here is your prescription QR code: {short_url}',
        to='+917304671744'
    )

    whatsapp_message = client.messages.create(
        from_=whatsapp_from,
        body=f'Here is your prescription QR code: {short_url}',
        to='whatsapp:+917304671744'
    )
    return qr_file_path


@app.route('/prescription/<prescription_id>', methods=['GET'])
def access_prescription(prescription_id):
    # Fetch prescription details from the database
    prescription = prescriptions_collection.find_one(
        {'prescription_id': prescription_id})
    if not prescription:
        return jsonify({'error': 'Prescription not found'}), 404

    # Retrieve the firebase_storage_url from the prescription document
    firebase_storage_url = prescription.get('firebase_path')

    if not firebase_storage_url:
        return jsonify({'error': 'Download URL not found in prescription'}), 404

    return jsonify({
        'download_url': firebase_storage_url
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
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'txt', 'plain'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


######################################### Process Handwritten Notes #############################################

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
    # Extract file extension from content type
    file_extension = content_type.split('/')[-1]
    print("file type", file_extension)

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
    elif file_extension == 'txt' or file_extension == 'plain':
        # Read the text file
        with open(file_path, 'r') as f:
            full_text = f.read()

    if not full_text:
        return jsonify({'error': 'No readable content found in the file'}), 400

    # Configure the generative AI model
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        os.remove(file_path)
        return jsonify({'error': 'AI API key not configured'}), 500
    # Configure the API key
    genai.configure(api_key=api_key)

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
    # Assuming each medicine is on a new line
    medicines = ast.literal_eval(list_str)

    if not medicines:
        return jsonify({'error': 'No medicines found in the text'}), 400

    # Generate the prescription PDF
    prescription_id = str(uuid.uuid4())
    generate_pdf(prescription_id, medicines, patient_name, doctor_name)

    # Generate the QR code
    qr_file_path = generate_qr_code(prescription_id)

    # Clean up the temporary file
    os.remove(file_path)

    # add in current medicine

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


# Run the Flask server on a different port
if __name__ == "__main__":
    app.run(debug=True, port=5001)
