import { Token } from './lexer';

class ParserCreator {
  private ast: any = {
    type: 'Program',
    body: [],
  };
  private RULES: Record<string, string> = {};
  private readonly joinedTokens: Token[] = [];

  public createNodeWith(token: string[] | string) {
    if (!Array.isArray(token)) token = [token];
    for (const tok of token) this.RULES[tok] = 'NodeCreator';
    return null;
  }

  public closeNodeWith(token: string[] | string) {
    if (!Array.isArray(token)) token = [token];
    for (const tok of token) this.RULES[tok] = 'NodeDestructor';
    return null;
  }

  protected constructor(
    private readonly tokens: Token[][]
  ) {
    this.tokens.map((line) => this.joinedTokens.push(...line));
  }

  private getRule(token: Token): string {
    return this.RULES[token.type];
  }

  private process(ast: any = this.ast) {
    for (const token of this.joinedTokens) {
      const rule: string = this.getRule(token);
      if (!rule) continue;
      switch (rule) {
        case 'NodeCreator':
          ast.body.push({
            type: 'Node',
            body: [],
            parent: ast,
          });
          ast = ast.body.slice(-1)[0];
          break;

        case 'NodeDestructor':
          ast = ast.parent;
          break;
      }
    }
    return this.ast;
  }

  public output() {
    const formatter = this.process();

    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return;
          }
          seen.add(value);
        }
        return value;
      };
    };

    return JSON.parse(
      JSON.stringify(formatter, getCircularReplacer(), 2)
    );
  }
}

export class Parser extends ParserCreator {
  public static createParser(tokens: Token[][]) {
    return new ParserCreator(tokens);
  }
}