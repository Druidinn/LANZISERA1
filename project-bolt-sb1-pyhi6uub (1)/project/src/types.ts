export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  category?: string;
}

export interface ExamConfig {
  numberOfQuestions: number;
  selectedCategories: string[];
}