export class RegisterDto {
  email: string;
  password?: string;
  username: string;
  avatar?: string;
}

export class LoginDto {
  email: string;
  password?: string;
}
