import google.generativeai as genai
import os

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