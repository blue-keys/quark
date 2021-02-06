import { Token } from './lexer';

class ParserCreator {
  private ast: any = {};
  private RULES: Record<string, string> = {};
  private readonly joinedTokens: Token[] = [];

  public createNodeWith(token: string[] | string) {
    if (!Array.isArray(token)) token = [token];
    for (const tok of token) this.RULES[tok] = 'Node';
    return null;
  }

  protected constructor(
    private readonly tokens: Token[][]
  ) {
    for (const line of this.tokens) {
      for (const token of line) {
        this.joinedTokens.push(token);
      }
    }
  }

  private process() {
    console.log(this.joinedTokens);
  }

  public output() {
    return this.process();
  }
}

export class Parser extends ParserCreator {
  public static createParser(tokens: Token[][]) {
    return new ParserCreator(tokens);
  }
}