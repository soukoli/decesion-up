// Debug utility for voice recording testing
// To use: Open browser console and run testVoiceRecording()

window.testVoiceRecording = function() {
  console.log('🎤 Testing Voice Recording Functionality...');
  
  // Check speech recognition support
  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  console.log('Speech Recognition Supported:', isSupported);
  
  if (!isSupported) {
    console.error('❌ Speech Recognition not supported in this browser');
    return;
  }
  
  // Test microphone permissions
  navigator.permissions.query({ name: 'microphone' }).then(result => {
    console.log('Microphone Permission:', result.state);
  }).catch(err => {
    console.warn('Could not check microphone permission:', err);
  });
  
  // Test getUserMedia
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      console.log('✅ Microphone access granted');
      stream.getTracks().forEach(track => track.stop());
    })
    .catch(err => {
      console.error('❌ Microphone access denied:', err);
    });
  
  // Create test recognition
  try {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'cs-CZ';
    
    recognition.onresult = (event) => {
      console.log('✅ Speech result received:', event);
    };
    
    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
    };
    
    console.log('✅ Speech Recognition object created successfully');
    
  } catch (err) {
    console.error('❌ Failed to create Speech Recognition:', err);
  }
};

console.log('🔧 Voice Recording Debug Utility Loaded');
console.log('Run testVoiceRecording() to test functionality');