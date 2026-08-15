import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @MaxLength(72) // límite práctico de bcrypt
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  displayName: string;
}
