import { Lexer } from './core/lexer';
import fs from 'fs/promises';

async function main(): Promise<void> {
  const content: string = await fs.readFile('./example/main.qrk', 'utf-8');
  Lexer.tokenize(content);
}

main();