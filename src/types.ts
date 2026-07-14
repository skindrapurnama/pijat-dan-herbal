export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "herbal" | "madu" | "minyak" | "teh";
  rating: number;
  reviews: number;
  stock: number;
  benefits: string[];
}

export interface Therapy {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  image: string;
  benefits: string[];
  process: string[];
}

export interface Therapist {
  id: string;
  name: string;
  role: string;
  photo: string;
  rating: number;
  experience: string;
  specialty: string[];
  gender: "L" | "P"; // Laki-laki / Perempuan (for Islamic therapy modesty)
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Booking {
  id: string;
  therapy: Therapy;
  therapist: Therapist;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerNotes?: string;
  status: "Menunggu" | "Selesai" | "Dibatalkan";
  totalPrice: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  suggestedProducts?: string[]; // IDs of products to showcase
  suggestedTherapies?: string[]; // IDs of therapies to showcase
}
