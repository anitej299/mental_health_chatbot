import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const chatEndRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [mood, setMood] = useState('calm');

    // Function to call the Generative Model
    const callGenerativeModel = async (userMessage) => {
        let apiContents = [];
        const systemInstruction = `You are a supportive, empathetic AI mental health companion...`; // Your original instruction

        apiContents.push({ role: "user", parts: [{ text: systemInstruction }] });
        apiContents.push({ role: "model", parts: [{ text: "Acknowledged. I'm here to provide empathetic support." }] });

        messages.forEach(msg => {
            const role = msg.sender === 'user' ? 'user' : 'model';
            apiContents.push({ role: role, parts: [{ text: msg.text }] });
        });

        apiContents.push({ role: "user", parts: [{ text: userMessage }] });

        const payload = { contents: apiContents };
        const apiKey = "AIzaSyD5rawAGtTJJW_3xg8WFZkoxN6VU8GMt34";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        let retries = 0;
        const maxRetries = 3;
        const baseDelay = 1000;

        while (retries < maxRetries) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`API request failed with status ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
                }

                const result = await response.json();
                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    return result.candidates[0].content.parts[0].text;
                } else {
                    throw new Error("No content received from the model or unexpected response structure.");
                }
            } catch (error) {
                retries++;
                if (retries < maxRetries) {
                    const delay = baseDelay * Math.pow(2, retries - 1);
                    await new Promise(res => setTimeout(res, delay));
                } else {
                    throw error;
                }
            }
        }
        throw new Error("Failed to get response from model after multiple retries.");
    };

    // Handle sending message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (inputText.trim() === '') return;

        const newUserMessage = { sender: 'user', text: inputText };
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);
        setInputText('');

        setIsTyping(true);
        setApiError(null);

        // Update mood based on message content
        const messageContent = inputText.toLowerCase();
        if (messageContent.includes('sad') || messageContent.includes('depress') || messageContent.includes('anxious')) {
            setMood('concerned');
        } else if (messageContent.includes('happy') || messageContent.includes('excited') || messageContent.includes('good')) {
            setMood('happy');
        } else {
            setMood('calm');
        }

        try {
            const chatbotReply = await callGenerativeModel(newUserMessage.text);
            setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: chatbotReply }]);
        } catch (error) {
            console.error("Error generating response:", error);
            setApiError("I'm having trouble connecting right now. Please try again later, or contact a professional if you need urgent help.");
        } finally {
            setIsTyping(false);
        }
    };

    // Scroll to the latest message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping, apiError]);

    // Initial greeting from the bot
    useEffect(() => {
        setMessages([{ sender: 'bot', text: "Hello! I'm an AI companion here to listen. How can I help you today?" }]);
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col w-full bg-white bg-opacity-95 backdrop-filter backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden h-[70vh] border border-gray-100">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 flex justify-between items-center rounded-t-3xl">
                    <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${mood === 'calm' ? 'bg-green-400' : mood === 'happy' ? 'bg-yellow-400' : 'bg-red-400'} animate-pulse`}></div>
                        <span className="text-xl font-bold">AI Companion</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="px-2 py-1 bg-green-400 bg-opacity-30 rounded-full text-xs font-semibold uppercase tracking-wider">
                            Online
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-yellow-50 text-yellow-800 p-2 text-xs text-center border-b border-yellow-200 font-medium">
                    <span className="font-bold">Important:</span> I am an AI chatbot and cannot provide professional medical advice.
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50 to-gray-100 bg-opacity-70 backdrop-blur-sm custom-scrollbar">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                        >
                            <div
                                className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm transition-all duration-300 transform ${message.sender === 'user'
                                    ? 'bg-blue-500 text-white rounded-br-none hover:scale-[1.02]'
                                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-100 hover:scale-[1.02]'
                                    }`}
                            >
                                {message.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white text-gray-800 p-3 rounded-2xl rounded-bl-none shadow-sm animate-typing-dots max-w-[85%] border border-gray-100">
                                <span className="dot animate-bounce1">.</span>
                                <span className="dot animate-bounce2">.</span>
                                <span className="dot animate-bounce3">.</span>
                            </div>
                        </div>
                    )}
                    {apiError && (
                        <div className="flex justify-center text-red-500 text-xs font-semibold mt-2 p-2 bg-red-50 rounded-lg">
                            {apiError}
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white flex items-center rounded-b-3xl">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Share your thoughts, I'm here to listen..."
                        className="flex-1 p-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={isTyping}
                        className="ml-2 p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium text-sm hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 shadow-md transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </form>
            </div>

            {/* Custom CSS */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c5c5c5;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                @keyframes typingDots {
                    0%, 80%, 100% { transform: initial; }
                    40% { transform: translateY(-3px); }
                }
                .animate-typing-dots .dot {
                    display: inline-block;
                    animation: typingDots 1.4s infinite ease-in-out both;
                }
                .animate-typing-dots .animate-bounce1 { animation-delay: 0.0s; }
                .animate-typing-dots .animate-bounce2 { animation-delay: 0.2s; }
                .animate-typing-dots .animate-bounce3 { animation-delay: 0.4s; }
            `}</style>
        </div>
    );
};

export default Chatbot;