class Chatbox {
    constructor() {
      this.args = {
        openButton: document.querySelector('.chatbox__button'),
        chatbox: document.querySelector('.chatbox__support'),
        sendButton: document.querySelector('.send__button'),
        input: document.querySelector('.chatbox__footer input'),
        suggestionsDiv: document.querySelector('.suggestions'),
        messagesContainer: document.querySelector('.chatbox__messages')
      };
      this.state = false;
      this.messages = [];
      this.suggestions = [];
      this.currentStep = null;
  
      console.log('Chatbox initialized', this.args);
    }
  
    display() {
      const { openButton, chatbox, sendButton, input } = this.args;
  
      if (!openButton || !chatbox || !sendButton || !input) {
        console.error('One or more required elements not found');
        return;
      }
  
      // Send message on button click
      sendButton.addEventListener('click', () => this.onSendButton(chatbox));
  
      // Send message on pressing Enter
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.onSendButton(chatbox);
        }
      });
  
      // Toggle chatbox visibility
      openButton.addEventListener('click', () => this.toggleState(chatbox));
    }
  
    async onSendButton(chatbox) {
      const textField = chatbox.querySelector('input');
      const text1 = textField.value.trim();
      if (text1 === "") return;
  
      const msg1 = { name: "User", message: text1 };
      this.messages.push(msg1);
  
      try {
        const response = await fetch('https://intimate-secondly-burro.ngrok-free.app/api/predict', {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ message: text1 }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
  
        const data = await response.json();
  
        const msg2 = {
          name: "iris",
          message: data.response.answer || "No response from backend"
        };
        this.messages.push(msg2);
  
        this.updateChatText(chatbox);
        textField.value = '';
        this.clearSuggestions();
  
        // Update suggestions and current step from backend response
        this.suggestions = data.response.suggestions || [];
        this.currentStep = data.response.current_step;
  
        this.showSuggestions();
  
      } catch (error) {
        console.error('Error:', error);
        const msg2 = { name: "iris", message: "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง" };
        this.messages.push(msg2);
        this.updateChatText(chatbox);
        textField.value = '';
      }
    }
  
    showSuggestions() {
      const { suggestionsDiv } = this.args;
      suggestionsDiv.innerHTML = '';
  
      if (this.suggestions.length > 0) {
        this.suggestions.forEach(suggestion => {
          const suggestionDiv = document.createElement('div');
          suggestionDiv.classList.add('suggestion-item');
          suggestionDiv.textContent = suggestion;
          suggestionDiv.onclick = () => this.selectSuggestion(suggestion);
          suggestionsDiv.appendChild(suggestionDiv);
        });
        suggestionsDiv.classList.add('active');
      } else {
        suggestionsDiv.classList.remove('active');
      }
    }
  
    clearSuggestions() {
      const { suggestionsDiv } = this.args;
      suggestionsDiv.innerHTML = '';
      suggestionsDiv.classList.remove('active');
    }
  
    selectSuggestion(value) {
      this.args.input.value = value;
      this.onSendButton(this.args.chatbox);
    }
  
    updateChatText(chatbox) {
      let html = '';
      this.messages.slice().reverse().forEach(item => {
        const messageClass = item.name === "iris" ? 'messages__item--visitor' : 'messages__item--operator';
        html += `<div class="messages__item ${messageClass}">${item.message}</div>`;
      });
  
      const messagesContainer = chatbox.querySelector('.chatbox__messages');
  
      if (messagesContainer) {
        messagesContainer.innerHTML = html;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } else {
        console.error('Messages container not found');
      }
    }
  
    toggleState(chatbox) {
      this.state = !this.state;
      chatbox.classList.toggle('chatbox--active', this.state);
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    window.chatbox = new Chatbox();
    chatbox.display();
  });
