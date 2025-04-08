import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface AnalysisResponse {
  amount: number;
  category: string;
  description: string;
}

class MessageAnalysisService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.BOT_API_URL || '';
    if (!this.apiUrl) {
      throw new Error('BOT_API_URL is not defined in environment variables');
    }
  }

  async analyzeMessage(message: string, userId: number): Promise<AnalysisResponse> {
    try {

      const response = await axios.post<AnalysisResponse>(`${this.apiUrl}messages/analyze`, {
        message,
        user_id: userId
      });
      console.log(response.data)
      return response.data;
    } catch (error) {
      console.error('Error analyzing message:', error);
      throw new Error('Failed to analyze message');
    }
  }
}

export const messageAnalysisService = new MessageAnalysisService(); 