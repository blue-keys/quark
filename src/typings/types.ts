import { Block, Element } from './block.ts';

export enum Types {
  String = 'String',
  Integer = 'Integer',
  Function = 'Function',
  Boolean = 'Boolean',
  None = 'None',
  List = 'List',
}

export interface ListType {
  type: Types.List,
  value: ValueElement[],
}

export interface StringType {
  type: Types.String,
  value: string,
}

export interface NoneType {
  type: Types.None,
  value: undefined,
}

export interface IntegerType {
  type: Types.Integer,
  value: number,
}

export interface FunctionType {
  type: Types.Function,
  args: Argument[],
  body: Block | (() => {}),
  js: boolean,
}

export interface BooleanType {
  type: Types.Boolean,
  value: boolean,
}

export interface Argument extends Element {
  variadic: boolean,
}

export type ValueElement = StringType | IntegerType | FunctionType | BooleanType | NoneType | ListType;