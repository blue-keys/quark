import {Lexer} from './core/lexer';
import fs from 'fs/promises';

async function main(): Promise<void> {
  Lexer.definition = {
    Comment: /--.*/,
    Type: /(Natural|Real)/,
    Arguments: /=>/,
    Operations: /(=|\+|-|\\)/,
    Integer: /(\d+(?:\.\d+)?)/,
    String: /".*?"/,
    Word: /\w+/,
    Bracket: /(\[|\])/,
    Range: /\.\./,
  };

  const content: string = await fs.readFile('./example/main.qrk', 'utf-8');
  const tokens = content
    .split(/\r?\n/g)
    .filter((x) => x.trim().length > 0)
    .map((line, index) => Lexer.tokenize(line).map((tok) => {
      tok.line = index;
      return tok;
    }));
  console.log(tokens);
}
main();