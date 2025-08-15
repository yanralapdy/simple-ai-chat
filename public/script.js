const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const sendButton = form.querySelector('button');

let messages = [];

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const userMessage = input.value.trim();
    if (!userMessage) return;

    appendMessage('user', userMessage);
    messages.push({ role: 'user', content: userMessage });
    input.value = '';

    // Disable input and button, and change button icon
    input.disabled = true;
    sendButton.disabled = true;
    changeButtonIcon(true);

    const botThinkingMessage = appendThinkingAnimation();

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

        await appendAnimatedMessage('bot', botResponseHtml);

        messages.push({ role: 'assistant', content: botResponseHtml });

    } catch (error) {
        console.error('Error fetching data:', error);
        chatBox.removeChild(botThinkingMessage);
        appendMessage('bot', 'Sorry, something went wrong. Please try again.');
    } finally {
        // Re-enable input and button, and revert icon
        input.disabled = false;
        sendButton.disabled = false;
        console.log('finally')
        changeButtonIcon(false);
    }
});

function appendMessage(sender, content) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    msg.innerHTML = content;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msg;
}

// New function to animate the text and render HTML
async function appendAnimatedMessage(sender, htmlContent) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const nodes = Array.from(tempDiv.childNodes);
    let nodeIndex = 0;
    let charIndex = 0;

    function animate() {
        if (nodeIndex >= nodes.length) {
            return;
        }

        const currentNode = nodes[nodeIndex];

        if (currentNode.nodeType === Node.TEXT_NODE) {
            if (charIndex < currentNode.textContent.length) {
                msg.innerHTML += currentNode.textContent.charAt(charIndex);
                charIndex++;
            } else {
                nodeIndex++;
                charIndex = 0;
            }
        } else {
            msg.appendChild(currentNode.cloneNode(true));
            nodeIndex++;
            charIndex = 0;
        }

        chatBox.scrollTop = chatBox.scrollHeight;
        requestAnimationFrame(animate);
    }

    animate();
}

function appendThinkingAnimation() {
    const thinkingDiv = document.createElement('div');
    thinkingDiv.classList.add('message', 'bot', 'thinking-animation');
    thinkingDiv.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    chatBox.appendChild(thinkingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return thinkingDiv;
}

function changeButtonIcon(isLoading) {
    sendButton.innerHTML = !isLoading ?
        `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-send"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>` :
        `<svg height="24px" width="24px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	        viewBox="0 0 10.334 10.334" xml:space="preserve">
            <g>
                <path style="fill:#f3f3f3;" d="M10.333,9.816c0,0.285-0.231,0.518-0.517,0.518H0.517C0.233,10.334,0,10.102,0,9.816V0.517
                    C0,0.232,0.231,0,0.517,0h9.299c0.285,0,0.517,0.231,0.517,0.517V9.816z"/>
            </g>
        </svg>`;
}
