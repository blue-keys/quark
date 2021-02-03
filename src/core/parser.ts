import { Token } from './lexer';

function isTokenContained(token: { type: string, value: string, }, tokens: Token[]) {
  return tokens.some((acc) => acc.type === token.type && acc.value === token.value);
}

function isType(str: string): boolean {
  return str.match(/[A-Z][a-z]*/) !== null;
}

export class Parser {
  private static ast = {
    type: 'Program',
    body: [],
    tabs: 0,
  };

  private static processNode(line: number, index: number, tokens: Token[][], ast) {
    ast.body = [];
    return this.processAny(line + 1, 0, tokens, ast);
  }

  private static variableDefinition(line: number, index: number, tokens: Token[][], ast) {
    const tokensLine = tokens[line];
    const token = tokensLine[index];

    ast.type = 'VariableDefinition';
    ast.return = { type: token.value };

    ++index;
    const name = tokensLine[index];
    if (name.type !== 'Word') throw 'Function name must be a word';
    ast.name = name.value;

    ++index;
    const interval = tokensLine[index].type === 'Interval'
      ? tokensLine[index]
      : null;
    if (interval) {
      ++index;
      const match = interval.value.match(/\[.*?]/)[0];
      const split = match.slice(1, match.length - 1);
      const [from = -Infinity, to = +Infinity] = split
        .split('..')
        .filter((acc) => acc.length > 0)
        .map(Number);
      ast.return.interval = {
        from,
        to,
      };
    }
    console.log(tokensLine[index]);
  }

  private static processAny(line: number, index: number, tokens: Token[][], ast) {
    if (!tokens[line]) return this.ast;
    const token: Token = tokens[line][index];
    if (!token) return this.processAny(line + 1, 0, tokens, ast);
    if (token.type === 'Comment') return this.processAny(line, index + 1, tokens, ast);

    // Processing instruction
    if (index === 0) {
      if (token.position < ast.tabs) return this.processAny(line, index, tokens, ast.parent);
      ast.body.push({
        type: 'Instruction',
        body: [],
        tabs: token.position,
        parent: ast,
      });
      if (token.type === 'Word' && isType(token.value))
        this.variableDefinition(line, index, tokens, ast.body.slice(-1)[0]);
    }
    // Processing new node
    if (token.value === 'do') {
      ast = ast.body.slice(-1)[0];
      ast.tabs += 2;
      return this.processAny(line + 1, 0, tokens, ast);
    }

    return this.processAny(line, index + 1, tokens, ast);
  }

  public static parse(tokens: Token[][]): typeof Parser.ast {
    this.processAny(0, 0, tokens, this.ast);
    return this.ast;
  }
}