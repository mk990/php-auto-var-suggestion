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
    const currentLineContent = editor.document.lineAt(
      editor.selection.active.line
    ).text;
    let re1 = RegExp(/.*[;|\(|\)|\[]/g); // if line end with ; () [] its check if line was ended
    let re2 = RegExp(/\$([a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)/g); // get all $ variables
    text = editor.document.getText();
    let allVars = text
      .replace(currentLineContent, "") //remove current Line
      .match(re1) // get only ended lines
      ?.join("\n") // join array
      .match(re2); // get all variables
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
