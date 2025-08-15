import express from 'express'
import dotenv from 'dotenv'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { GoogleGenAI } from '@google/genai'
import cors from 'cors'
import {fileURLToPath} from 'url'
import MarkdownIt from 'markdown-it' // 1. Import markdown-it

dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// 2. Initialize markdown-it
const md = new MarkdownIt()

const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})

const models = async (contents) => await genAI.models.generateContent({
    model: 'models/gemini-2.5-flash',
    contents
})

const imageToGenerativePart = (filePath) => ({
    inlineData: {
      data: fs.readFileSync(filePath).toString('base64'),
      mimeType: 'image/png',
    },
})

const upload = multer({dest: 'uploads/'})

app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;
    try {
        const result = await models(prompt)
        res.json({success: true, data: result.text()})
    } catch (e) {
        res.status(500).json({error: e})
    }
})

app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    const prompt = req.body.prompt || 'Decribe the image'
    const image = imageToGenerativePart(req.file.path)
    
    try {
        const result = await models([prompt, image]) 
        res.json({success: true, data: result.text()})
    } catch (e) {
        res.status(500).json({error: e})
    }
})

app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
    const audioBuffer = fs.readFileSync(req.file.path)
    const base64Audio = audioBuffer.toString('base64')
    const audioPart = {
        inlineData: {
            data: base64Audio,
            mimeType: req.file.mimetype
        }
    }
    
    try {
        const result = await models(['Transcribe and analyze the audio file', audioPart]) 
        res.json({success: true, data: result.text()})
    } catch (e) {
        res.status(500).json({error: e})
    }
})

app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    const filePath = req.file.path;
    const buffer = fs.readFileSync(filePath);
    const base64Data = buffer.toString('base64');
    const mimeType = req.file.mimetype;
    try {
        const documentPart = {
            inlineData: { data: base64Data, mimeType }
        }

        const result = await models(['Analyze this document:', documentPart]);
        const response = await result.response;
        res.json({ output: response.text() });
    } catch (error) {
        res.status(500).json({ error: error-message });
    } finally {
        fs.unlinkSync(filePath)
    }
})

const extractText = (resp) => {
    try {
        const text =
            resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
            JSON.stringify(resp, null, 2);

        return text;
    } catch (err) {
        console.error("Error extracting text:", err);
        return JSON.stringify(resp, null, 2);
    }
}

// API CHAT
app.post('/api/chat', async (req, res) => {
    try {
        const {messages} = req.body;
        console.log({messages})
        if (!Array.isArray(messages)) throw new Error("messages must be an array");

        const contents = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{
                text: msg.content
            }]
        }));

        const resp = await models(contents);
        const markdownText = extractText(resp)

        // 3. Convert Markdown to HTML here
        const htmlContent = md.render(markdownText);

        res.json({
            // 4. Send the HTML content back to the client
            result: htmlContent
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

const PORT = 3000

app.listen(PORT, () => {
    console.log('Gemini Api App listening on port : ' + PORT)
})

