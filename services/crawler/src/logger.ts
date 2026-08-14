import { blue, green, yellow, red, cyan, gray, bold } from 'colorette';

function timestamp(): string {
  return gray(new Date().toLocaleTimeString());
}

export const logger = {
  info: (msg: string, ...args: any[]) => {
    console.log(`${timestamp()} ${blue(bold('[INFO]'))} ${msg}`, ...args);
  },
  success: (msg: string, ...args: any[]) => {
    console.log(`${timestamp()} ${green(bold('[SUCCESS]'))} ${msg}`, ...args);
  },
  warn: (msg: string, ...args: any[]) => {
    console.warn(`${timestamp()} ${yellow(bold('[WARN]'))} ${msg}`, ...args);
  },
  error: (msg: string, ...args: any[]) => {
    console.error(`${timestamp()} ${red(bold('[ERROR]'))} ${msg}`, ...args);
  },
  step: (step: string, msg: string) => {
    console.log(`${timestamp()} ${cyan(bold(`[${step}]`))} ${msg}`);
  }
};
