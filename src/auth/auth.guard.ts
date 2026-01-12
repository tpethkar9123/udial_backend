import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { verifyJwt } from './clerk';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Missing Authorization header');
    const token = authHeader.replace('Bearer ', '');
    const valid = await verifyJwt(token);
    if (!valid) throw new UnauthorizedException('Invalid token');
    req.user = valid;
    return true;
  }
}
