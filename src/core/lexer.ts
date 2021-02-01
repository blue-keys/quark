export class Lexer {
  public static definition: Record<string, RegExp> = {};
  private static tokens: Token[] = [];

  private static matchNearestToken(content: string, slice: number): LexerMatch {
    const top = Object
      .entries(this.definition)
      .map(([name, regex]) => ({
        name,
        regex: content.slice(slice).match(regex),
      }));
    const filtered = top.filter((x) => x.regex !== null);
    const match = filtered.sort((a, b) => a.regex.index - b.regex.index)[0];
    if (!match) return undefined;
    match.regex.index += slice;
    return match;
  }

  private static parseAsToken(match: LexerMatch): Token {
    return {
      type: match.name,
      value: match.regex[0],
      length: match.regex[0].length,
      position: match.regex.index,
      line: 0,
    }
  }

  private static format(content: string, slice: number = 0) {
    const match = this.matchNearestToken(content, slice);
    if (!match) return this.tokens;
    const matchSlice = match.regex.index + match.regex[0].length;
    this.tokens.push(this.parseAsToken(match))
    return this.format(content, matchSlice);
  }

  public static tokenize(content: string): Token[] {
    this.tokens = [];
    return this.format(content);
  }
}

interface LexerMatch {
  name: string,
  regex: RegExpMatchArray,
}
export interface Token {
  type: string,
  value: string,
  length: number,
  position: number,
  line: number,
}