export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface SignupFormData extends SignupCredentials {
  passwordConfirm: string;
}
