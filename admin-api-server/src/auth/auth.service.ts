import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validatePassword(
    receivedPassword: string,
    storedPasswordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(receivedPassword, storedPasswordHash);
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && !user.disabled) {
      const hasValidPassword = await this.validatePassword(pass, user.password);
      if (hasValidPassword) {
        return user;
      }
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      userName: user.userName,
      sub: user.id,
      scope: user.roles,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
