import { Lexer } from './core/lexer';
import fs from 'fs/promises';
import { Parser } from './core/parser';

async function main(): Promise<void> {
  Lexer.definition = {
    Comment: /#.*/,
    BracketOpen: /(\{|\[|\()/,
    BracketClose: /(}|]|\))/,
    String: /".*?"/,
    Integer: /\d+/,
    Word: /\w+/,
  };

  const content: string = await fs.readFile('./example/main.qrk', 'utf-8');
  const tokens = content
    .split(/\r?\n/g)
    .filter((x) => x.trim().length > 0)
    .map((line, index) => Lexer.tokenize(line).map((tok) => {
      tok.line = index;
      return tok;
    }));

  const parser = Parser.createParser(tokens);
  parser.createNodeWith('BracketOpen');
  parser.closeNodeWith('BracketClose');

  parser.addRule('Word', function(token, previous, _, lastNode) {
    if (previous.value === '(') {
      return {
        type: 'FunctionCall',
        value: token.value,
      }
    }
    if (lastNode.type === 'FunctionCall') {
      return {
        type: 'Argument',
        value: token.value,
      }
    }
    return {
      type: 'Word',
      value: token.value,
    }
  });

  console.log(JSON.stringify(parser.output(), null, 2));
}
main();