import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

interface AnalysisResponse {
  amount: number;
  category: string;
  description: string;
}

class MessageAnalysisService {
  private apiUrl: string;
  private axiosInstance;

  constructor() {
    this.apiUrl = process.env.BOT_API_URL || '';
    console.log('Message Analysis Service initialized with URL:', this.apiUrl);

    // Create axios instance with connection pooling
    this.axiosInstance = axios.create({
      timeout: 5000,
      maxRedirects: 5,
      httpsAgent: new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 25, // Maximum concurrent connections
        maxFreeSockets: 10 // Maximum idle sockets to keep alive
      })
    });
  }

  // Simple fallback parser for when the API is not available
  private parseFallback(message: string): AnalysisResponse | null {
    const parts = message.trim().split(/\s+/);
    if (parts.length < 2) return null;

    const amount = parseFloat(parts[0]);
    if (isNaN(amount)) return null;

    const category = parts[1].toLowerCase();
    const description = parts.slice(2).join(' ') || category;

    return {
      amount,
      category,
      description
    };
  }

  async analyzeMessage(message: string, userId: number): Promise<AnalysisResponse> {
    try {
      // Only try API if URL is configured
      if (this.apiUrl) {
        try {
          console.log('Attempting to analyze message via API:', message);
          const response = await this.axiosInstance.post<AnalysisResponse>(`${this.apiUrl}messages/analyze`, {
            message,
            user_id: userId
          });
          console.log('API Response:', response.data);
          return response.data;
        } catch (error) {
          const apiError = error as AxiosError;
          console.log('API analysis failed, falling back to local parsing:', apiError.message);
        }
      }

      // Fallback to local parsing
      const fallbackResult = this.parseFallback(message);
      if (!fallbackResult) {
        return {
          amount: 0,
          category: 'unknown',
          description: 'Could not parse message'
        };
      }
      return fallbackResult;

    } catch (error) {
      console.error('Error in message analysis:', error);
      throw new Error('Failed to analyze message');
    }
  }
}

// Create a singleton instance
export const messageAnalysisService = new MessageAnalysisService(); 