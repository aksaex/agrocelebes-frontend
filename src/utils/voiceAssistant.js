// frontend/src/utils/voiceAssistant.js

export const speakNotification = (message, lang = 'id-ID') => {
  if (!('speechSynthesis' in window)) {
    console.warn('Browser Anda tidak mendukung fitur Suara.');
    return;
  }

  // Hentikan suara sebelumnya agar tidak bertumpuk
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = lang;
  
  // Kecepatan diperlambat (0.85) agar artikulasinya jelas terdengar oleh petani
  utterance.rate = 0.85; 
  utterance.pitch = 1;

  // Mencari suara wanita/pria Indonesia bawaan dari HP/Browser
  const voices = window.speechSynthesis.getVoices();
  const localVoice = voices.find(v => v.lang.replace('_', '-').startsWith('id'));
  
  if (localVoice) {
    utterance.voice = localVoice;
  }

  window.speechSynthesis.speak(utterance);
};