
import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    throw new Error("API Key is missing from environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to grab a frame from a video base64 string to send to Gemini
export const getVideoFrame = (videoBase64: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoBase64;
    video.currentTime = 0.5; // Capture frame at 0.5s
    video.muted = true;
    
    video.onloadeddata = () => {
       video.onseeked = () => {
         const canvas = document.createElement('canvas');
         canvas.width = video.videoWidth;
         canvas.height = video.videoHeight;
         const ctx = canvas.getContext('2d');
         ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
         const frame = canvas.toDataURL('image/jpeg', 0.7);
         resolve(frame);
       }
       video.currentTime = 0.1; 
    };
    video.onerror = (e) => reject(e);
  });
}

export const generateGamerCaption = async (base64Data: string, isVideo: boolean = false): Promise<string> => {
  try {
    const ai = getAiClient();
    let imageToSend = base64Data;
    if (isVideo) {
        try {
            imageToSend = await getVideoFrame(base64Data);
        } catch (e) {
            const textResponse = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: "Write a hype social media caption for a gaming video clip. Use gamer slang. max 20 words.",
            });
            return textResponse.text || "Check out this clip! 🎬 #gaming";
        }
    }

    const cleanBase64 = imageToSend.includes(',') ? imageToSend.split(',')[1] : imageToSend;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: { data: cleanBase64, mimeType: 'image/jpeg' },
          },
          {
            text: isVideo 
                ? "You are a social media manager. Analyze this frame from a gaming clip. Write a short, hype Instagram caption for this video. Mention the game if you recognize it. Under 280 chars. Use emojis."
                : "You are a social media manager. Analyze this gaming screenshot. Write a short, hype Instagram caption. Mention the game if recognized. Under 280 chars. Use emojis."
          },
        ],
      },
    });

    return response.text || "Just dropped a new clip! 🎮 #gaming #lootdrop";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Grinding the ladder! 🚀 #gaming";
  }
};

export const suggestGameTag = async (base64Data: string, isVideo: boolean = false): Promise<string> => {
  try {
    const ai = getAiClient();
    let imageToSend = base64Data;
    if (isVideo) {
        try {
            imageToSend = await getVideoFrame(base64Data);
        } catch (e) {
            return "Gaming";
        }
    }

    const cleanBase64 = imageToSend.includes(',') ? imageToSend.split(',')[1] : imageToSend;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: { data: cleanBase64, mimeType: 'image/jpeg' },
          },
          {
            text: "Identify the video game in this image. Return ONLY the name of the game. If it's a PC setup, return 'Battlestation'. If unknown, return 'Gaming'."
          }
        ]
      }
    });
    return response.text?.trim() || "Gaming";
  } catch (e) {
    return "Gaming";
  }
}

export const generateWelcomeEmail = async (username: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Write a short, hype welcome email for a new user named "${username}" joining "LootDrop", a social app for gamers. 
            Subject line included. Use gamer slang (GG, drops, leveling up). Keep it under 100 words.`
        });
        return response.text || `Welcome to LootDrop, ${username}! GLHF!`;
    } catch (e) {
        return `Welcome to LootDrop, ${username}! Get ready to share your best clips.`;
    }
}

export const generateResetPasswordEmail = async (username: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Write a short, urgent gamer-themed password reset email for a user named "${username}". 
            Topic: "Signal Lost - Recovery Code". Use terms like "Encrypted Key", "Backdoor", "Hard Reset", "Relink Signal". 
            Keep it hype but professional. Under 100 words. Format as a simple text block.`
        });
        return response.text || `Hey ${username}, your signal was lost. Use this recovery key to get back in the game!`;
    } catch (e) {
        return `Password reset requested for ${username}. Follow the link to recover your account.`;
    }
}
