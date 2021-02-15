import { Token } from './lexer';

class ParserCreator {
  private ast: any = [];
  private currAST: any = this.ast;

  private RULES: { property: string | RegExp, callback: any, options: any }[] = [];
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
      if (rule.options.except) {
        for (const exception of rule.options.except) {
          if (typeof exception === 'string' && (exception === token.type || exception === token.value)) {
            return;
          }
          if (exception instanceof RegExp && token.value.match(exception)) {
            return;
          }
        }
      }
      if (typeof rule.property === 'string' && (rule.property === token.type || rule.property === token.value)) {
        return rule.callback;
      } else if (rule.property instanceof RegExp && token.value.match(rule.property)) {
        return rule.callback;
      }
    }
  }
  public register(rules: (string | RegExp) | (string | RegExp)[], options, callback: any) {
    if (!Array.isArray(rules)) rules = [rules];
    for (const rule of rules) {
      this.RULES.push({
        property: rule,
        options,
        callback,
      });
    }
  }

  public findParent(): any | null {
    this.currAST = this.currAST.parent || this.ast;
    return this.currAST;
  }
  public pushNode() {
    this.currAST.push([]);
    const parent = this.currAST;
    this.currAST = this.currAST.slice(-1)[0];
    this.currAST.parent = parent;
    return this.currAST;
  }
  public pushAtom(el: Record<string, any>) {
    return this.currAST.push(el);
  }

  public parse() {
    for (const index in this.joinedTokens) {
      const startIndex = Number(index) - 1 >= 0 ? Number(index) - 1 : 0
      const [previous, token, next] = this.joinedTokens.slice(startIndex, Number(index) + 2);
      const rule = this.getRule(token);
      if (!rule) continue;
      rule(token, previous, next);
    }
    return this.initAST();
  }

  private initAST() {
    function isContainer(element: any): boolean {
      return Array.isArray(element) && element.every((child) => Array.isArray(child));
    }
    const defineProperty = (name: string, value: any) => {
      Object.defineProperty(this.ast, name, { writable: true, enumerable: false });
      this.ast[name] = value;
    };

    // Output property
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
    function formatAST(ast) {
      return JSON.parse(JSON.stringify(ast, getCircularReplacer()))
    }

    defineProperty('output', formatAST(this.ast));

    // AST Visitor
    defineProperty('visit', () => {
      const visitor = (node) => {
        if (isContainer(node)) {
          for (const child of node) visitor(child);
        } else {
          const expression: string = node[0].value;
          if (this.ast.handlers[expression]) {
            this.ast.handlers[expression](node[0], formatAST(node), node);
          }
        }
      };
      visitor(this.ast);
    });
    defineProperty('handlers', {});
    defineProperty('on', (type: string, callback) => {
        this.ast.handlers[type] = callback;
      });

    return this.ast;
  }
}

export class Parser extends ParserCreator {
  public static createParser(tokens: Token[][]) {
    return new ParserCreator(tokens);
  }
}