import { Token } from './lexer';

class ParserCreator {
  private ast: any = { tabs: 0 };
  private RULES: Record<string, any> = {};
  private readonly joinedTokens: Token[] = [];

  protected constructor(
    private readonly tokens: Token[][],
    private readonly options: any,
  ) {
    this.tokens.map((line) => this.joinedTokens.push(...line));
  }

  private getRule(token: Token): any {
    return this.RULES[token.type];
  }

  private findParent(token: Token, ast) {
    if (ast.tabs === token.position) return ast;
    return this.findParent(token, ast.parent);
  }

  public node(opener: string, closer?: string) {
    if (this.options.indentation || !closer) {
      this.options.indentation = true;
      this.RULES[opener] = 'NodeIndentation';
    } else {
      this.RULES[opener] = 'NodeCreator';
      this.RULES[closer] = 'NodeDestructor';
    }
  }

  public parse() {
    let state: number = 0;
    let ast = this.ast;
    for (const index in this.joinedTokens) {
      const token = this.joinedTokens[index];
      const rule = this.getRule(token);
      if (this.options.indentation) {
        if (rule && rule === 'NodeIndentation') {
          state = 1;
          ast.body = [{ parent: ast, }];
          continue;
        }
        if (state === 1) {
          ast = ast.body.slice(-1)[0];
          ast.tabs = token.position;
          state = 0;
        }
        if (this.joinedTokens[Number(index) - 1]?.position > token.position && this.joinedTokens[Number(index) - 1]?.type !== 'Block') {
          ast = this.findParent(token, ast);
        }
      }
      if (token.type === 'Keyword') {
        if (token.value === 'func') {
          ast.type = 'FunctionDeclaration';
        }
      } else if (token.type === 'Word') {
      }
    }
    console.log(this.ast)
  }
}

export class Parser extends ParserCreator {
  public static createParser(tokens: Token[][], options: any) {
    return new ParserCreator(tokens, options);
  }
}