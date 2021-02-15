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

  function updateEveryNode(types, values, node) {
    values = values.slice(0, types.length);
    function visit(_node) {
      if (Array.isArray(_node)) {
        for (const child of _node) visit(child);
      } else {
        if (types.includes(_node.value)) {
          const arg = values[types.indexOf(_node.value)];
          for (const prop in arg) {
            _node[prop] = arg[prop];
          }
        }
      }
      return _node;
    }
    return visit(node);
  }

  const ast = parser.parse();

  const macros = {};

  ast.on('macro', function(_, atom, _ast) {
    macros[atom[1].value] = {
      args: atom.slice(2, 3)[0].map((x) => x.value),
      body: atom[3],
    };

    ast.on(atom[1].value, function(node, _, _ast) {
      const args = _ast.slice(1);
      _ast.splice(
        0,
        _ast.length,
        ...updateEveryNode(macros[node.value].args, args, macros[node.value].body)
      );
    })
  });

  ast.visit();
  console.log(ast.raw());
})();