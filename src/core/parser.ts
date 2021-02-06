import { Token } from './lexer';

class ParserCreator {
  private ast: any = {
    type: 'Program',
    body: [],
  };
  private RULES: Record<string, any> = {};
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

  private getRule(token: Token): any {
    return this.RULES[token.type];
  }

  public addRule(token: string[] | string, rule: (..._: any) => any) {
    if (!Array.isArray(token)) token = [token];
    for (const tok of token) this.RULES[tok] = rule;
    return null;
  }

  private process(ast: any = this.ast) {
    for (const index in this.joinedTokens) {
      const token = this.joinedTokens[index];
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
        default:
          if (typeof rule !== 'function') break;
          const res = (<(..._: any) => any>rule)(
            ast,
            token,
            this.joinedTokens[Number(index) - 1],
            this.joinedTokens[Number(index) + 1]
          );
          for (const key in res) {
            ast[key] = res[key];
          }
          console.log(ast);
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