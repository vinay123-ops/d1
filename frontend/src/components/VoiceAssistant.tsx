import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, X, MessageCircle } from 'lucide-react';

// TypeScript declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceAssistantProps {
  onClose: () => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = () => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      processCommand(speechResult);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setResponse('Sorry, I couldn\'t understand that. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('help')) {
      setResponse('I can help you navigate the dashboard. Try saying "show alerts", "open zones", or "toggle sidebar".');
    } else if (lowerCommand.includes('alert')) {
      setResponse('Navigating to alerts section...');
      // Add navigation logic here
    } else if (lowerCommand.includes('zone')) {
      setResponse('Opening zones view...');
      // Add navigation logic here
    } else if (lowerCommand.includes('sidebar')) {
      setResponse('Toggling sidebar...');
      // Add sidebar toggle logic here
    } else {
      setResponse('I can help you with navigation. Say "help" for available commands.');
    }

    // Text-to-speech response
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(response);
      speechSynthesis.speak(utterance);
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-4 right-4 z-50 w-80"
    >
      <Card className="bg-card/95 backdrop-blur-sm border border-border shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Voice Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSupported ? (
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2" />
              Voice recognition is not supported in this browser.
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant={isListening ? "destructive" : "default"}
                  size="lg"
                  className="w-full h-12"
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-5 w-5 mr-2" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5 mr-2" />
                      Start Voice Command
                    </>
                  )}
                </Button>
              </div>

              {isListening && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="flex justify-center"
                >
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                </motion.div>
              )}

              {transcript && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">You said:</p>
                  <p className="text-sm text-muted-foreground">{transcript}</p>
                </div>
              )}

              {response && (
                <div className="p-3 bg-primary/10 rounded-md">
                  <p className="text-sm font-medium">Assistant:</p>
                  <p className="text-sm">{response}</p>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Available Commands:</p>
                <ul className="space-y-1">
                  <li>• "Help" - Show available commands</li>
                  <li>• "Show alerts" - Navigate to alerts</li>
                  <li>• "Open zones" - View zone map</li>
                  <li>• "Toggle sidebar" - Open/close sidebar</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VoiceAssistant; 