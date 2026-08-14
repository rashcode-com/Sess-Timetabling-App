import * as p from '@clack/prompts';
import { cyan, dim } from 'colorette';
import { CrawlerConfig } from './config.js';

export async function promptMissingConfig(config: CrawlerConfig): Promise<CrawlerConfig> {
  const isInteractive = process.stdin.isTTY;
  if (!isInteractive) {
    return config;
  }

  // If both username and password are provided, no need for full wizard unless requested
  const needsCredentials = !config.username || !config.password;
  if (!needsCredentials) {
    return config;
  }

  p.intro(cyan('🎓 SESS Timetabling Crawler — Interactive Setup'));

  let sessUrl = config.sessUrl;
  if (!sessUrl) {
    const urlInput = await p.text({
      message: 'Enter SESS Portal URL:',
      initialValue: 'https://sess.sku.ac.ir/',
      validate: (val) => (!val ? 'URL is required' : undefined),
    });
    if (p.isCancel(urlInput)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
    sessUrl = urlInput;
  }

  let username = config.username;
  if (!username) {
    const userInput = await p.text({
      message: 'Enter your SESS Student/Staff ID (Username):',
      placeholder: 'e.g. 9912345678',
      validate: (val) => (!val ? 'Username is required to log into SESS' : undefined),
    });
    if (p.isCancel(userInput)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
    username = userInput;
  }

  let password = config.password;
  if (!password) {
    const passInput = await p.password({
      message: 'Enter your SESS Portal Password:',
      mask: '•',
      validate: (val) => (!val ? 'Password is required' : undefined),
    });
    if (p.isCancel(passInput)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
    password = passInput;
  }

  let semesterValue = config.semesterValue;
  if (!semesterValue) {
    const semInput = await p.text({
      message: 'Enter Semester Code (or leave empty for active semester):',
      placeholder: 'e.g. 4031 (optional)',
    });
    if (p.isCancel(semInput)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
    semesterValue = semInput ? semInput.trim() : undefined;
  }

  p.outro(dim('Starting browser automation...'));

  return {
    ...config,
    sessUrl,
    username,
    password,
    semesterValue,
  };
}
