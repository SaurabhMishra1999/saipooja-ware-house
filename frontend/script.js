document.addEventListener('DOMContentLoaded', () => {
    const aiChatIcon = document.getElementById('ai-chat-icon');
    const chatPopup = document.getElementById('ai-chat-popup');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatInputField = document.getElementById('chat-input-field');
    const chatMessages = document.getElementById('chat-messages');

    // Toggle chat popup
    aiChatIcon.addEventListener('click', () => {
        chatPopup.classList.toggle('show');
    });

    closeChatBtn.addEventListener('click', () => {
        chatPopup.classList.remove('show');
    });

    // Handle sending a message
    sendChatBtn.addEventListener('click', sendMessage);
    chatInputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const userMessage = chatInputField.value.trim();
        if (userMessage === '') return;

        // Display user's message
        addMessage(userMessage, 'user');

        // Clear the input field
        chatInputField.value = '';

        // Simulate AI response after a short delay
        setTimeout(() => {
            const aiResponse = getAIResponse(userMessage);
            addMessage(aiResponse, 'ai');
        }, 1000);
    }

    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        
        const p = document.createElement('p');
        p.textContent = text;
        messageElement.appendChild(p);
        
        chatMessages.appendChild(messageElement);
        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Simple AI response logic
    function getAIResponse(question) {
        const lowerCaseQuestion = question.toLowerCase();
        
        if (lowerCaseQuestion.includes('cold storage') || lowerCaseQuestion.includes('temperature')) {
            return 'Our cold storage units are state-of-the-art and can be set to a wide range of temperatures. What specific temperature do you require?';
        } else if (lowerCaseQuestion.includes('price') || lowerCaseQuestion.includes('cost') || lowerCaseQuestion.includes('rate')) {
            return 'Pricing depends on the size of the unit and the duration. For a detailed quote, please visit our login page and get in touch with our team.';
        } else if (lowerCaseQuestion.includes('location') || lowerCaseQuestion.includes('address')) {
            return 'Our facility is located at Plot No. 98, Sector 2, Pardi, Nagpur, Maharashtra 440035.';
        } else if (lowerCaseQuestion.includes('contact') || lowerCaseQuestion.includes('phone')) {
            return 'You can contact us at +91 93247 47577. We are available 24/7.';
        } else if (lowerCaseQuestion.includes('hello') || lowerCaseQuestion.includes('hi')) {
            return 'Hello! How can I assist you with our warehouse services today?';
        } else {
            return 'Thank you for your question. For more detailed inquiries, please contact our support team via WhatsApp or phone. We are here to help!';
        }
    }
});
