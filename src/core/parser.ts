import { Token } from './lexer';

export class Parser {
  private static ast = {};

  private static processAny() {
    console.log(this.ast)
  }

  public static parse(tokens: Token[]): typeof Parser.ast {
    console.log(this.ast)
    return this.ast;
  }
}