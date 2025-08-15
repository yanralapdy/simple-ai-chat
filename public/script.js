const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

let messages = [];

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const userMessage = input.value.trim();
    if (!userMessage) return;

    appendMessage('user', userMessage);
    messages.push({ role: 'user', content: userMessage });
    input.value = '';

    const botThinkingMessage = appendMessage('bot', 'Gemini is thinking...');
    try {

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const botResponseHtml = data.result;

        chatBox.removeChild(botThinkingMessage);

        appendMessage('bot', botResponseHtml, true);

        messages.push({ role: 'assistant', content: botResponseHtml });

    } catch (error) {
        console.error('Error fetching data:', error);
        chatBox.removeChild(botThinkingMessage);
        appendMessage('bot', 'Sorry, something went wrong. Please try again.');
    }
});

function appendMessage(sender, content, isHtml = false) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);

    if (isHtml) {
        msg.innerHTML = content;
    } else {
        msg.textContent = content;
    }

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msg;
}
