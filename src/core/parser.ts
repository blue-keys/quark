import { Token } from './lexer';

export class Parser {
  private static ast = {
    type: 'Program',
    body: [],
  };

  private static processNode(line: number, index: number, tokens: Token[][], ast) {
    ast.body.push({
      type: 'Node',
      body: [],
      parent: ast,
    });
    return this.processAny(line + 1, 0, tokens, ast.body.slice(-1)[0]);
  }

  private static processAny(line: number, index: number, tokens: Token[][], ast) {
    if (!tokens[line]) return this.ast;
    const token: Token = tokens[line][index];
    if (index === 0) {
      if (!ast.tabs) ast.tabs = token.position;
      if (token.position < ast.tabs) {
        return this.processAny(line, index, tokens, ast.parent);
      }
    }
    if (index >= tokens[line].length) return this.processAny(line + 1, 0, tokens, ast);
    if (token.value === 'do') return this.processNode(line, index, tokens, ast);
    return this.processAny(line, index + 1, tokens, ast);
  }

  public static parse(tokens: Token[][]): typeof Parser.ast {
    this.processAny(0, 0, tokens, this.ast);
    return this.ast.body.slice(-1)[0];
  }
}