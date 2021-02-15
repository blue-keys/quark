import { Lexer } from './core/lexer';
import fs from 'fs/promises';
import { Parser } from './core/parser';

(async function(): Promise<void> {
  Lexer.definition = {
    Comment: /#.*/,
    Bracket: /[(){}]/,
    String: /"(?:[^"\\]|\\.)*"/,
    Integer: /(-)?\d+(\.\d+)?/,
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

  // Node related parsing
  parser.register(['(', '{'], {}, () => parser.pushNode());
  parser.register([')', '}'], {}, () => parser.findParent());

  // Types related parsing
  parser.register('Word', {}, (token) =>
    parser.pushAtom({
      type: token.type,
      value: token.value,
    })
  );

  parser.register('String', {}, (token) =>
    parser.pushAtom({
      type: token.type,
      value: token.value.slice(1, token.value.length - 1)
    })
  );

  parser.register('Integer', {}, (token) =>
    parser.pushAtom({
      type: token.type,
      value: Number(token.value)
    })
  );

  const ast = parser.parse();
  console.log(ast.output);

  ast.on('macro', function(_, atom, _ast) {
    console.log('MACRO DETECTED:', atom[1].value);
    console.log('MACRO ARGS:', atom.slice(2, 3)[0].map((x) => x.value));
  });

  ast.visit();
})();