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
  parser.addRule('Word', function(ast, token, previous, next) {
    if (previous.value === '(') {
      return {
        type: 'FunctionCall',
        function: token.value,
        args: [],
      }
    }
    return {
      type: 'Word',
      value: token.value,
    };
  });

  console.log(parser.output());
}
main();