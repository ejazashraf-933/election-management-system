import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, context }) => {
        return `[${timestamp}] [${level}] ${context ? '[' + context + ']' : ''} ${message}`;
      }),
    ),
  }),
];

// File transports only in local dev — serverless filesystem is read-only
if (!process.env.VERCEL) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/app.log',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/errors.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
      ),
    }),
  );
}

export const loggerConfig: WinstonModuleOptions = { transports };
