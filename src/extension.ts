import * as vscode from "vscode";
let oldVars: String[] = [];
export async function activate(context: vscode.ExtensionContext) {
  addDollarVar();
  vscode.window.onDidChangeTextEditorSelection((e) => {
    addDollarVar();
  });
}
export function deactivate() {}

function addDollarVar() {
  const editor = vscode.window.activeTextEditor;
  let text = "";
  if (editor) {
    let re1 = RegExp(/.*[;|\(|\)|\[]/g);
    let re2 = RegExp(/\$([a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)/g);
    text = editor.document.getText();
    let allVars = text.match(re1)?.join("\n").match(re2);
    if (!allVars) {
      allVars = ["$this"];
    }
    let newVar = uniqNewVars(allVars);
    newVar?.forEach((phpVar) => {
      vscode.languages.registerCompletionItemProvider(
        {
          scheme: "file",
          language: "php",
        },
        {
          provideCompletionItems(
            document: vscode.TextDocument,
            position: vscode.Position
          ) {
            const completionItem = new vscode.CompletionItem(
              phpVar.replace("$", "") + "",
              vscode.CompletionItemKind.Snippet
            );
            completionItem.insertText = phpVar;
            completionItem.detail = phpVar;
            return [completionItem];
          },
        }
      );
    });
  }
}

function uniqNewVars(array: string[]) {
  if (!array) {
    return [];
  }
  let uniques: string[] = [];
  let blackList = ["$this"];
  for (const value of array) {
    if (!oldVars.includes(value) && !blackList.includes(value)) {
      uniques.push(value);
      oldVars.push(value);
    }
  }
  return uniques;
}
