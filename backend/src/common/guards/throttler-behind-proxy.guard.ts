import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Prendre en compte les headers de proxy pour obtenir la vraie IP
    return req.ips && req.ips.length ? req.ips[0] : req.ip;
  }
}