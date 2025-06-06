## How to run client

### Setting up the .env file
```
VITE_API_URL="http://localhost:5000"
VITE_PYTHON_API_URL="http://localhost:5001"
VITE_API_KEY=
VITE_AUTH_DOMAIN=
VITE_PROJECT_ID=
VITE_STORAGE_BUCKET=
VITE_MESSAGING_SENDER_ID=
VITE_APP_ID=
VITE_BUCKET_URL=
VITE_GNEWS_API_KEY=
```

### Initializing the CORS for Google Cloud

### Step 1: Install `gsutil` (if not already installed)

`gsutil` is part of the Google Cloud SDK. If you don’t have it installed, follow these steps to install it:

1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install).
2. Once installed, initialize it by running:

    ```bash
    gcloud init
    ```

### Step 2: Create the `cors.json` File

Create a `cors.json` file with your desired CORS configuration. Here's the file:

```json
[
  {
    "origin": ["http://localhost:5173"],
    "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization"]
  }
]
```

### Step 3: Set CORS Using `gsutil`

Now, use the following `gsutil` command to set the CORS configuration for your Firebase Storage bucket:

```bash
gsutil cors set cors.json <bucket-url>
```

Make sure to replace `<bucket-url>` with your bucket name if it's different.

### Step 4: Verify the CORS Configuration

You can verify that the CORS settings were applied correctly by running:

```bash
gsutil cors get <bucket-url>
```

This will display the current CORS configuration for your bucket.

### Running the client:

```
npm run dev
```

## How to run server

### Setting up the .env file
```
MONGODB_URI=""
JWT_SECRET=""
PORT=5000
JWT_EXPIRE="<your-custom-duration>(for e.g. 10h)"
DIALOGFLOW_PROJECT_ID=""
DIALOGFLOW_KEY_PATH=""
GEMINI_API_KEY=""
```

### Running the server

```
npm run server
```

## Running the flask server

### Setting up the .env file
```
# Firebase Configuration
FIREBASE_CREDENTIALS='<path-to-admin-sdk-file>'
FIREBASE_BUCKET='<firebase-buket-url>'

# MongoDB Configuration
MONGO_URI="<mongodb-uri>"


# Twilio Configuration
ACCOUNT_SID=''
TWILIO_AUTH_TOKEN=''
TWILIO_PHONE_NUMBER = '<Enter-phone-number>'
TWILIO_WHATSAPP_FROM='whatsapp:<Enter-phone-number>'

# Gemini AI Configuration
GEMINI_API_KEY="<gemini-api-key>"

```

### Step 1: Create a Virtual Environment

Run the following command based on your operating system.

### Windows
```bash
python -m venv venv
```

### Linux / macOS
```bash
python3 -m venv venv
```

This will create a virtual environment named `venv` in your current directory.

## Step 2: Activate the Virtual Environment

### Windows
```bash
cd venv\Scripts\ 
```

```bash
activate.bat
```

### Linux / macOS
```bash
source venv/bin/activate
```

After activation, your terminal prompt should show the virtual environment name, typically as `(env)`.

### Install requirements from requirements.txt by coming back to the flask server directory

```bash
pip install -r requirements.txt
```


## Step 3: Deactivate the Virtual Environment

To deactivate, simply run:
```bash
deactivate
```

You are now back to the global Python environment.

---

```
> **Tip:** Always activate your virtual environment before installing any packages to keep dependencies isolated.
```

### Running the flask server

```
python app.py
```

## How to setup Dialogflow
In the Dialogflow_Object folder a zip file is provided just import it in the dialogflow and there you are ready to go.
