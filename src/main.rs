mod utils;
mod core;
use regex::Regex;
use std::fs;
use crate::core::lexer::Lexer;
use crate::utils::string::{string_to_static};
use crate::utils::regex::regex_to_array;

fn main() {

  let file = fs::read_to_string("sample/index.qrk");
  if file.is_err() { return println!("An error occured during file reading..."); }
  let re: Regex = Regex::new(r"\r?\n").unwrap();
  let mut content: Vec<&str> = regex_to_array(re.split(&file.unwrap()));

  format_code(&mut content);
  let code: String = content.join("");

  let lexer = Lexer::new(string_to_static(code));
  lexer.lexer();
}

fn format_code(code: &mut Vec<&str>) {
  for el in code { *el = el.trim(); }
}