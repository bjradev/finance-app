export interface User {
  id: string;
  email: string;
  name: string;
  defaultCurrency?: string;
}

export interface ProfileData {
  id: string;
  name: string;
  defaultCurrency: string;
}
