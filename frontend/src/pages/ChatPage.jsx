import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import { useToast } from '../context/ToastContext';
import { useSchemes, getBookmarkedSchemeIds, toggleBookmarkSchemeId, evaluateEligibility } from '../hooks/useSchemes';
import {
  createSTTListener,
  isSTTSupported,
  speakText,
  stopSpeech,
  isTTSSupported,
} from '../services/speechService';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Sparkles,
  ExternalLink,
  RefreshCw,
  HelpCircle,
  Sprout,
  Landmark,
} from 'lucide-react';
import { fetchAPI } from '../services/api';

export default function ChatPage() {
  const { schemes: SCHEMES_DATA, loading: schemesLoading } = useSchemes();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const messagesEndRef = useRef(null);

  const initialPrompt = searchParams.get('prompt') || '';

  const [inputMessage, setInputMessage] = useState(initialPrompt);
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: 'Namaste! I am your KrishiSahayak AI Assistant. How can I help you today with government schemes, subsidy applications, or crop advisory?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      schemeRef: null,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState(null);

  const suggestedPrompts = [
    'What schemes are available for small wheat farmers in UP?',
    'How do I apply for PM-KISAN ₹6,000 installment?',
    'Required documents for Kisan Credit Card (KCC) loan',
    'How to claim crop insurance for drought under PMFBY?',
    'Subsidies for Solar Water Pumps under PM-KUSUM',
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle STT Voice Listening
  useEffect(() => {
    let stt;
    if (isListening && isSTTSupported()) {
      stt = createSTTListener({
        lang: 'hi-IN',
        onResult: (transcript) => {
          setInputMessage(transcript);
        },
        onError: (err) => {
          toast.error('Voice recognition error.');
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        },
      });
      stt.start();
    }
    return () => {
      if (stt) stt.stop();
    };
  }, [isListening, toast]);

  const toggleMic = () => {
    if (!isSTTSupported()) {
      toast.warning('Web Speech API is not supported in your browser.');
      return;
    }
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      toast.info('Listening for your voice input...');
    }
  };

  // Handle Send Message
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call backend API (runs live Gemini AI with your API key)
      const res = await fetchAPI('/chat', {
        method: 'POST',
        body: { message: text.trim() },
      });

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.reply || res.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        schemeRef: Array.isArray(res.relevantSchemes) && res.relevantSchemes.length > 0 ? res.relevantSchemes[0] : null,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Speak response if TTS active
      if (isTTSActive && speechService.isTTSSupported() && aiMsg.text) {
        speechService.speakText(aiMsg.text, { lang: 'hi-IN' });
      }
    } catch (apiErr) {
      console.warn('Backend API call failed, using fallback:', apiErr);
      // Fallback for offline mode
      let aiText = `Namaste! Based on your query "${text}", small & marginal farmers qualify for financial support under PM-KISAN, crop insurance via PMFBY, and solar pump grants under PM-KUSUM.`;
      let schemeRef = SCHEMES_DATA[0];

      const lower = text.toLowerCase();
      if (lower.includes('pm-kisan')) {
        aiText = 'PM-KISAN provides ₹6,000/year directly to landholding farmers in 3 installments of ₹2,000.';
        schemeRef = SCHEMES_DATA.find((s) => s.id === 'pm-kisan');
      }

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        schemeRef: schemeRef,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle TTS Read Aloud for Message
  const handleToggleTTS = (msgId, text) => {
    if (!isTTSSupported()) {
      toast.warning('Text-to-Speech is not supported in your browser.');
      return;
    }

    if (activeSpeechId === msgId) {
      stopSpeech();
      setActiveSpeechId(null);
    } else {
      stopSpeech();
      setActiveSpeechId(msgId);
      speakText(text, {
        lang: 'hi-IN',
        onEnd: () => setActiveSpeechId(null),
        onError: () => {
          setActiveSpeechId(null);
          toast.error('TTS error occurred.');
        },
      });
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
        {/* Header Bar */}
        <header
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card) var(--radius-card) 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bot size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: 'var(--font-size-sm)', margin: 0, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                KrishiSahayak AI Voice Assistant
              </h2>
              <span style={{ fontSize: '10px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-success)', display: 'inline-block' }} />
                STT / TTS Active
              </span>
            </div>
          </div>

          <Button
            variant="text"
            size="sm"
            icon={RefreshCw}
            onClick={() =>
              setMessages([
                {
                  id: '1',
                  sender: 'ai',
                  text: 'Namaste! How can I assist you with farming schemes or crop queries today?',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
          >
            Clear
          </Button>
        </header>

        {/* Message History Area */}
        <div
          style={{
            flex: 1,
            padding: '16px',
            backgroundColor: 'var(--color-background)',
            borderLeft: '1px solid var(--color-border)',
            borderRight: '1px solid var(--color-border)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            width: '100%',
          }}
        >
          {/* Suggested Prompts Banner */}
          {messages.length <= 2 && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                SUGGESTED FARMER QUESTIONS:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface-elevated)',
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--font-size-xs)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSpeakingThis = activeSpeechId === msg.id;

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  gap: '10px',
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={18} />
                  </div>
                )}

                <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      backgroundColor: isUser ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                      color: isUser ? '#FFFFFF' : 'var(--color-text-primary)',
                      border: isUser ? 'none' : '1px solid var(--color-border)',
                      fontSize: 'var(--font-size-sm)',
                      lineHeight: '1.5',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    {msg.text}

                    {/* Scheme Reference Link Badge if attached */}
                    {msg.schemeRef && (
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '8px 12px',
                          backgroundColor: 'var(--color-surface)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/schemes/${msg.schemeRef.id}`)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Landmark size={16} style={{ color: 'var(--color-primary)' }} />
                          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                            {msg.schemeRef.title}
                          </span>
                        </div>
                        <ExternalLink size={14} style={{ color: 'var(--color-primary)' }} />
                      </div>
                    )}
                  </div>

                  {/* Message Timestamp & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', padding: '0 4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{msg.timestamp}</span>

                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleToggleTTS(msg.id, msg.text)}
                        title={isSpeakingThis ? 'Stop voice' : 'Listen aloud (TTS)'}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: isSpeakingThis ? 'var(--color-accent)' : 'var(--color-text-muted)',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {isSpeakingThis ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-accent)',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <User size={18} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} />
              </div>
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={14} className="pulse-animation" />
                <span>AI Assistant is typing response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: '0 0 var(--radius-card) var(--radius-card)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <button
            type="button"
            onClick={toggleMic}
            title={isListening ? 'Stop Mic' : 'Voice Input (STT)'}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              border: isListening ? '2px solid var(--color-error)' : '1px solid var(--color-border)',
              backgroundColor: isListening ? 'var(--color-error-bg)' : 'var(--color-surface)',
              color: isListening ? 'var(--color-error)' : 'var(--color-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input
            type="text"
            placeholder={isListening ? 'Listening...' : 'Ask in Hindi / English...'}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            style={{
              flex: 1,
              minWidth: 0,
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              outline: 'none',
            }}
          />

          <Button
            variant="primary"
            size="sm"
            icon={Send}
            disabled={!inputMessage.trim()}
            onClick={() => handleSendMessage()}
          >
            Send
          </Button>
        </div>
      </div>
    </Layout>
  );
}
