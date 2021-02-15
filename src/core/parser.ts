import { Token } from './lexer';

class ParserCreator {
  private ast: any = { tabs: 0 };
  private RULES: { property: string | RegExp, callback: any }[] = [];
  private readonly joinedTokens: Token[] = [];

  protected constructor(
    private readonly tokens: Token[][],
  ) {
    this.tokens.map((line) => this.joinedTokens.push(...line));
  }

  private getRule(token: Token): any {
    const tokenTypes = this.RULES.filter((x) => typeof x.property === 'string');
    const regexTypes = this.RULES.filter((x) => x.property instanceof RegExp);
    const rules = [...regexTypes, ...tokenTypes];
    for (const rule of rules) {
      if (typeof rule.property === 'string' && (rule.property === token.type || rule.property === token.value)) {
        return rule.callback;
      } else if (rule.property instanceof RegExp && token.value.match(rule.property)) {
        return rule.callback;
      }
    }
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

  public register(rule: string | RegExp, callback: any) {
    this.RULES.push({
      property: rule,
      callback,
    });
  }

  public parse() {
    for (const index in this.joinedTokens) {
      const startIndex = Number(index) - 1 >= 0 ? Number(index) - 1 : 0
      const [previous, token, next] = this.joinedTokens.slice(startIndex, Number(index) + 2);
      const rule = this.getRule(token);
      if (!rule) continue;
      rule(token, previous, next);
    }
    return this.ast;
  }
}

export class Parser extends ParserCreator {
  public static createParser(tokens: Token[][]) {
    return new ParserCreator(tokens);
  }
}