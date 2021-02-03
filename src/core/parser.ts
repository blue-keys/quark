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

  private static varialeDefinition(token: Token, ast) {
    console.log(ast);
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
    }
    // Processing new node
    if (token.value === 'do') {
      ast = ast.body.slice(-1)[0];
      ast.type = 'Node';
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