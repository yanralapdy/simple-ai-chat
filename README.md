# Gemini AI Chatbot

A simple and responsive chat application that leverages the Gemini API for conversational responses. The app includes a smooth typing animation, a responsive design, and a clear user interface to enhance the chat experience.

## Installation

To get the app up and running on your local machine, follow these steps:

1. **Clone the repository:**

```

git clone [your-repository-url]
cd [your-repository-directory]

```

2. **Install dependencies:**

```

npm install

```

3. **Set up the environment file:**
Create a new file named `.env` in the root directory. Copy the contents from `env.example` and paste them into your new `.env` file.

4. **Add your Gemini API Key:**
In the `.env` file you just created, add your Gemini API key:

```

GEMINI\_API\_KEY="YOUR\_API\_KEY\_HERE"

````

5. **Build the CSS:**
The project uses Tailwind CSS. To build the necessary stylesheet, run one of the following commands:

* **For development (watches for changes):**

  ```
  npm run tailwind:watch
  
  ```

* **For production (one-time build):**

  ```
  npm run build
  
  ```
6. Install optional dev dependencies:
For a better development experience, you can install nodemon to automatically restart the server whenever you make changes to the code.

  ```
  npm install nodemon --save-dev

  ```

7. **Start the server:**

* **For development: The dev script will use nodemon to automatically restart the server.:**

```
npm run dev

```

* **For production::**

```
npm start

```

## Usage

Once the server is running, open your web browser and navigate to:

[http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)

You can now begin chatting with the Gemini AI model.j

