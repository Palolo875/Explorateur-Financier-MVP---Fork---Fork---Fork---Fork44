import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    // Prendre en compte les headers de proxy pour obtenir la vraie IP
    return req.ips.length ? req.ips[0] : req.ip;
  }
}