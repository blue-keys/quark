import { Token } from './lexer';

class ParserCreator {
  private ast: any[] = [];
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

  private findParent(node: any, root: any = this.ast): any | null {
    let found: any | null = null;
    for (const child of root) {
      if (child === node) return root;
      if ('type' in child && 'value' in child) continue;
      found = this.findParent(node, child);
      if (found !== null) return found;
    }
    return null;
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
          ast.push([]);
          ast = ast.slice(-1)[0];
          break;
        case 'NodeDestructor':
          ast = this.findParent(ast, this.ast);
          break;
        default:
          const fn = <(..._: any) => any><unknown>rule;
          const res = fn(
            token,
            this.joinedTokens[Number(index) - 1],
            this.joinedTokens[Number(index) + 1],
            ast.slice(-1)[0],
          );
          if (res !== undefined) ast.push(res);
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