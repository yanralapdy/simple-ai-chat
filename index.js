const express = require('express')
const dotenv = require('dotenv')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { GoogleGenAI } = require('@google/genai')

dotenv.config()
const app = express()
app.use(express.json())

const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})

const models = async (contents) => await genAI.models.generateContent({
    model: 'models/gemini-2.0-flash',
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
        res.json({success: true, data: result.text})
    } catch (e) {
        res.status(500).json({error: e})
    }
})

app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    const prompt = req.body.prompt || 'Decribe the image'
    const image = imageToGenerativePart(req.file.path)
    
    try {
        const result = await models([prompt, image]) 
        res.json({success: true, data: result.text})
    } catch (e) {
        res.status(500).json({error: e})
    }
})

app.post('/generate-from-audio', upload.single('image'), async (req, res) => {
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
        res.json({success: true, data: result.text})
    } catch (e) {
        res.status(500).json({error: e})
    }
})

app-post ('/generate-from-document', upload-single('document'), async (req, res) => {
    const filePath = req.file.path;
    const buffer = fs.readFileSync(filePath);
    const base64Data = buffer.toString('base64');
    const mimeType = req.file.mimetype;
    try {
        const documentPart = {
            inlineData: { data: base64Data, mimeType }
        }

        const result = await model.generateContent(['Analyze this document:', documentPart]);
        const response = await result.response;
        res. json({ output: response.text() });
    } catch (error) {
        res.status(500).json({ error: error-message });
    } finally {
        fs.unlinkSync(filePath)
    }
})

const PORT = 3000

app.listen(PORT, () => {
    console.log('Gemini Api App listening on port : ' + PORT)
})
