## How to run client

### Setting up the .env file
```
VITE_API_URL=
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

### Step 1: Create a Virtual Environment

Run the following command based on your operating system.

### Windows
```bash
python -m venv env
```

### Linux / macOS
```bash
python3 -m venv env
```

This will create a virtual environment named `env` in your current directory.

## Step 2: Activate the Virtual Environment

### Windows
```bash
.\env\Scripts\activate
```

### Linux / macOS
```bash
source env/bin/activate
```

After activation, your terminal prompt should show the virtual environment name, typically as `(env)`.

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
