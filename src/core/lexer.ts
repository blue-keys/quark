export class Lexer {
  public static tokenize(code: string) {
    const content: string[] = code
      .split(/\r?\n/g)
      .filter((line) => line.trim().length > 0);
    const output: Token[][] = [];
    
    for (const indexLine in content) {
      const line = content[indexLine];
      const state: State = {
        status: '',
        tabs: true,
        tokens: {
          container: [],
          tmp: '',
        }
      };
      for (const charIndex in line as any) {
        const char: string = line[charIndex];
        if (char === ' ' && state.tabs) {
          state.tokens.tmp += char;
        } else {
          if (state.tokens.tmp.length > 0 && state.tabs) {
            state.tokens.container.push({ 
              type: TokenTypes.Space,
              value: state.tokens.tmp,
              line: Number(indexLine),
              position: Number(charIndex) - state.tokens.tmp.length,
              length: state.tokens.tmp.length,
            });
            state.tokens.tmp = '';
          }
          state.tabs = false;
          break;
        }
      }
      output.push(state.tokens.container);
    }
    console.log(output)
  }
}

interface State {
  status: string,
  tabs: boolean,
  tokens: {
    container: Token[],
    tmp: string,
  }
}

enum TokenTypes {
  Space = 'Space',
  Type = 'Type',
  Keyword = 'Keyword',
  Word = 'Word',
}

interface Token {
  type: TokenTypes,
  value: string,
  line: number,
  position: number,
  length: number,
}