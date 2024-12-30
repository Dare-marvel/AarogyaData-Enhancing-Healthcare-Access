import google.generativeai as genai
import os

# Set your API key as an environment variable
os.environ["API_KEY"] = "AIzaSyAXEu4sPwPIW8B1A114yU-Iza-wlQ_I18Q"

# Configure the API key
genai.configure(api_key=os.environ["API_KEY"])

# Create a model instance
model = genai.GenerativeModel("gemini-1.5-flash")

# Prepare the image path
image_path = "doc2.jpg"

# Create a prompt with the image path
prompt = f"Extract medicine from this image: {image_path}"

# Generate text from the image
response = model.generate_content(prompt)
print(response.text)