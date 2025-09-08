import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  USE_FINGPT: process.env.USE_FINGPT ?? 'false',
  USE_FINROBOT: process.env.USE_FINROBOT ?? 'false',
  USE_TF: process.env.USE_TF ?? 'false',
}));

