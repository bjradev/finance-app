export interface Transaction {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
}
