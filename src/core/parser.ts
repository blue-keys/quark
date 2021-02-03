import { Token } from './lexer';

function isTokenContained(token: { type: string, value: string, }, tokens: Token[]) {
  return tokens.some((acc) => acc.type === token.type && acc.value === token.value);
}
function isType(str: string): boolean {
  return str.match(/[A-Z][a-z]*/) !== null;
}
function chunkEveryTokens(tokens: Token[], cb: any) {
  const array = [];
  let tmp = [];
  const reversedTokens = tokens.slice().reverse();
  for (const _tok of reversedTokens) {
    tmp.push(_tok);
    if (cb(_tok) === true) {
      array.push(tmp.reverse());
      tmp = [];
    }
  }
  return array.reverse() || [];
}

export class Parser {
  private static ast = {
    type: 'Program',
    body: [],
    tabs: 0,
  };

  private static functionArgument(tokens: Token[]) {
    if (tokens.length === 0) return;
    const arg: any = {};
    let index: number = 0;

    if (!isType(tokens[index].value)) throw 'First word of argument must be a type';

    arg.return = { type: tokens[index].value };
    ++index;
    if (tokens[index].type !== 'Word') throw 'Function argument name must be a word';
    arg.name = tokens[index].value;
    ++index;
    if (!tokens[index]) return arg;

    const match = tokens[index].value.match(/\[.*?]/)[0];
    const split = match.slice(1, match.length - 1);
    const [from = -Infinity, to = +Infinity] = split
      .split('..')
      .filter((acc) => acc.length > 0)
      .map(Number);
    arg.return.interval = {
      from,
      to,
    };

    return arg;
  }

  private static variableDefinition(line: number, index: number, tokens: Token[][], ast) {
    const tokensLine = tokens[line];
    const token = tokensLine[index];

    ast.type = 'VariableDefinition';
    ast.return = { type: token.value };

    ++index;
    const name = tokensLine[index];
    if (name.type !== 'Word') throw 'Function name must be a word';
    ast.name = name.value;

    ++index;
    const interval = tokensLine[index].type === 'Interval'
      ? tokensLine[index]
      : null;
    if (interval) {
      ++index;
      const match = interval.value.match(/\[.*?]/)[0];
      const split = match.slice(1, match.length - 1);
      const [from = -Infinity, to = +Infinity] = split
        .split('..')
        .filter((acc) => acc.length > 0)
        .map(Number);
      ast.return.interval = {
        from,
        to,
      };
    }
    const type = tokensLine[index].type === 'Arguments'
      ? 'FunctionDefinition'
      : ast.type;
    ast.type = type;
    if (isTokenContained({ type: 'Word', value: 'do' }, tokensLine))
      ast.type = 'FunctionDefinition';
    else
      ast.tabs = 2;
    if (ast.type === 'VariableDefinition') return;
    if (type === 'FunctionDefinition')
      ast.args = [];

    const args = tokensLine
      .slice(index + 1, tokensLine.findIndex((acc) => acc.value === '='));
    const splitArgs = chunkEveryTokens(
      args,
      (tok: Token) => tok.type === 'Word' && isType(tok.value)
    );

    ast.args = splitArgs.map((x) => this.functionArgument(x || []));

    return this.processAny(line, tokensLine.findIndex((acc) => acc.value === '='), tokens, ast);
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
      if (token.type === 'Word' && isType(token.value))
        return this.variableDefinition(line, index, tokens, ast.body.slice(-1)[0]);
    }
    // Processing new node
    if (token.value === 'do') {
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