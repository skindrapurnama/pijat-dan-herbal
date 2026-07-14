import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent crash on boot if API Key is missing
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    throw new Error("GEMINI_API_KEY_MISSING");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// API Endpoint for AI consultation chatbot
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const client = getGeminiClient();

    const systemInstruction = `Anda adalah ahli herbalis dan terapis senior di Asy-Syifa Wellness, sebuah klinik modern yang mengintegrasikan pengobatan herbal alami dan terapi tradisional (Bekam Medis, Gurah Pernapasan, Pijat Kebugaran).
Tugas Anda adalah mendengarkan keluhan kesehatan pengguna (misalnya: pusing, batuk pilek, lelah, asma, sinusitis, pegal-pegal) dan memberikan saran terapi serta herba yang tepat dengan bahasa Indonesia yang ramah, sopan, hangat, dan profesional. Jangan berikan diagnosa klinis medis yang menakut-nakuti, melainkan berikan saran ikhtiar herba dan terapi.

Daftar produk herbal kami:
- 'prod-1' (Madu Gurah Asy-Syifa): Madu dengan Srigunggu, jahe merah, kencur. Bagus untuk batuk, napas sesak, lendir berlebih, suara serak, penyanyi/qori, sinusitis, flu.
- 'prod-2' (Kapsul Habbatussauda Premium): Jintan hitam kapsul. Bagus untuk imunitas, stamina harian, menstabilkan darah & kolesterol.
- 'prod-3' (Minyak Herba Sinergi / MHS): Minyak herba multiguna hangat. Bagus untuk pegal-pegal, nyeri otot, memar, terkilir, luka ringan.
- 'prod-4' (Minyak Zaitun Ruqyah Al-Afiat): Minyak zaitun extra virgin ber-ruqyah. Bagus untuk pelumas bekam, melembapkan kulit, terapi ruqyah syar'iyyah mandiri.
- 'prod-5' (Teh Daun Kelor Organik): Teh kelor kaya nutrisi. Bagus untuk kolesterol, menurunkan gula darah/diabetes, melancarkan ASI.
- 'prod-6' (Madu Hitam Pahit Mahoni): Madu pahit mahoni. Bagus untuk lambung/maag/gerd, gula darah, asam urat.

Daftar jasa terapi kami:
- 'ther-bekam' (Bekam Basah Medis (Steril & Higienis)): Bagus untuk sakit kepala, migrain, pundak kaku, detoks darah, mengontrol tensi tinggi, kolesterol.
- 'ther-gurah' (Gurah Pernapasan & Suara Tradisional): Bagus untuk mengeluarkan dahak/lendir hidung & tenggorokan, pernapasan sinus, asma, melonggarkan napas, menyaringkan suara.
- 'ther-pijat' (Pijat Kebubaran & Totok Acupressure): Bagus untuk kelelahan badan, kurang tidur/insomnia, leher kaku, stres pikiran.

Format output WAJIB berupa JSON yang valid dengan struktur properti berikut:
1. 'answer': Teks jawaban Anda dalam bahasa Indonesia yang terperinci, ramah, dan bersahabat (menggunakan format markdown untuk list, tebal, dll). Jelaskan mengapa herba atau terapi tersebut cocok untuk keluhan mereka secara rasional.
2. 'recommendedProducts': Array string ID produk herba dari daftar di atas yang benar-benar relevan dengan keluhan mereka (maksimal 2 produk). Contoh: ['prod-1', 'prod-3']
3. 'recommendedTherapies': Array string ID terapi dari daftar di atas yang benar-benar relevan dengan keluhan mereka (maksimal 2 terapi). Contoh: ['ther-bekam']

Berikan respon medis tradisional yang menenangkan dan selalu doakan kesehatan mereka.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: messages,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: {
              type: Type.STRING,
              description: "Jawaban penjelasan herbalis dalam bahasa Indonesia yang ramah, sopan, dan terperinci memakai markdown."
            },
            recommendedProducts: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description: "ID produk yang disarankan. Hanya boleh bernilai: 'prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6'."
            },
            recommendedTherapies: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description: "ID terapi yang disarankan. Hanya boleh bernilai: 'ther-bekam', 'ther-gurah', 'ther-pijat'."
            }
          },
          required: ["answer"]
        }
      }
    });

    const replyText = response.text || "{}";
    const resultJson = JSON.parse(replyText);
    res.json(resultJson);
  } catch (error: any) {
    console.warn("Gemini API not available, falling back to local simulation:", error.message);
    
    // Fallback simulation if API key is missing or errored out
    const userPrompt = messages[messages.length - 1]?.parts?.[0]?.text || "";
    const lowerPrompt = userPrompt.toLowerCase();
    
    let answer = `Halo Kak! Terima kasih sudah berkonsultasi di Asy-Syifa Wellness. 🙏\n\n`;
    let recommendedProducts: string[] = [];
    let recommendedTherapies: string[] = [];
    
    if (lowerPrompt.includes("gurah") || lowerPrompt.includes("suara") || lowerPrompt.includes("lendir") || lowerPrompt.includes("sinus") || lowerPrompt.includes("napas") || lowerPrompt.includes("batuk")) {
      answer += `Untuk keluhan saluran napas, suara serak, lendir berlebih di hidung, atau batuk, kami sangat menganjurkan **Terapi Gurah Pernapasan & Suara Tradisional**. Terapi ini mengeluarkan dahak menyumbat secara langsung menggunakan ekstrak herbal Srigunggu.\n\nSebagai penunjang di rumah, Kakak bisa mengonsumsi **Madu Gurah Asy-Syifa** secara rutin 2x sehari untuk mengikis sisa lendir dan melegakan tenggorokan gatal.`;
      recommendedProducts = ["prod-1"];
      recommendedTherapies = ["ther-gurah"];
    } else if (lowerPrompt.includes("bekam") || lowerPrompt.includes("pusing") || lowerPrompt.includes("kepala") || lowerPrompt.includes("tensi") || lowerPrompt.includes("darah tinggi") || lowerPrompt.includes("kolesterol")) {
      answer += `Untuk keluhan sakit kepala, migrain, pundak kaku, atau kadar kolesterol tinggi, kami sangat merekomendasikan **Bekam Basah Medis (Steril & Higienis)**. Terapi bekam basah membuang darah kotor menyumbat sehingga aliran darah kembali lancar.\n\nUntuk pendamping herba harian, Kakak bisa meminum **Kapsul Habbatussauda Premium** untuk menjaga kestabilkan organ tubuh dan imunitas.`;
      recommendedProducts = ["prod-2"];
      recommendedTherapies = ["ther-bekam"];
    } else if (lowerPrompt.includes("pijat") || lowerPrompt.includes("capek") || lowerPrompt.includes("lelah") || lowerPrompt.includes("pegal") || lowerPrompt.includes("stres") || lowerPrompt.includes("tidur") || lowerPrompt.includes("insomnia")) {
      answer += `Untuk tubuh yang letih setelah bekerja, kaku otot, stres emosional, ataupun susah tidur, pilihan terbaik adalah **Pijat Kebubaran & Totok Acupressure** kami. Pijatan kami akan merelaksasi seluruh otot dan saraf Anda.\n\nSerta di rumah, sediakan **Minyak Herba Sinergi (MHS)** untuk membaluri punggung dan telapak kaki Kakak sebelum istirahat malam agar tidur nyenyak.`;
      recommendedProducts = ["prod-3"];
      recommendedTherapies = ["ther-pijat"];
    } else if (lowerPrompt.includes("lambung") || lowerPrompt.includes("maag") || lowerPrompt.includes("gerd") || lowerPrompt.includes("perut")) {
      answer += `Untuk gangguan perut kembung, perih maag, atau GERD, kami menyarankan herba **Madu Hitam Pahit Mahoni** karena alkaloid alaminya bekerja menenangkan radang lambung dan menstabilkan asam lambung.\n\nSelain itu, Kakak bisa memesan **Pijat Kebubaran** agar ketegangan otot diafragma perut kembali rileks.`;
      recommendedProducts = ["prod-6"];
      recommendedTherapies = ["ther-pijat"];
    } else if (lowerPrompt.includes("gula") || lowerPrompt.includes("diabetes") || lowerPrompt.includes("kolesterol") || lowerPrompt.includes("diet")) {
      answer += `Untuk keluhan gula darah tinggi, kolesterol tinggi, atau detoksifikasi lemak, kami sarankan meminum **Teh Daun Kelor Organik** secara teratur pagi dan sore hari.\n\nDi samping itu, terapi **Bekam Basah Medis** sangat baik dikerjakan sebulan sekali untuk meregenerasi sel darah dan membuang sumbatan zat berlebih.`;
      recommendedProducts = ["prod-5"];
      recommendedTherapies = ["ther-bekam"];
    } else {
      answer += `Selamat datang di Asy-Syifa Wellness. Apapun keluhan kesehatan Kakak, baik pegal, pusing, gangguan napas, maupun penurunan imun, kami siap membantu dengan solusi herba alami dan terapi sunnah/tradisional yang higienis.\n\nSilakan sampaikan gejala spesifik Kakak agar saya dapat merekomendasikan herbal dan terapi terbaik untuk Kakak.`;
      recommendedProducts = ["prod-1", "prod-2", "prod-3"];
      recommendedTherapies = ["ther-bekam", "ther-gurah", "ther-pijat"];
    }
    
    answer += `\n\n*(Catatan: Mode Simulasi Cerdas Aktif - Untuk mengaktifkan AI asli, masukkan GEMINI_API_KEY di Secrets)*`;
    
    res.json({
      answer,
      recommendedProducts,
      recommendedTherapies
    });
  }
});

// Configure Vite and static assets serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
