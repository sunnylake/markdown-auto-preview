/// MARKDOWN PREVIEW SWITCHER - VSCode Extension

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
      if (!editor?.document) return;

      const uri = editor.document.uri;
      const viewColumn = editor.viewColumn;
      const isMarkdown = editor.document.languageId === 'markdown';

      if (isMarkdown) {
        // 打开 Markdown 预览（右侧）
        await vscode.commands.executeCommand('markdown.showPreviewToSide');
        await waitUntilMarkdownPreviewOpened();
      } else {
        // 关闭所有 Markdown 预览标签
        for (const group of vscode.window.tabGroups.all) {
          for (const tab of group.tabs) {
            const input: any = tab.input;
            const isLikelyMarkdownPreview =
              input?.viewType?.includes('markdown.preview') ||
              tab.label.toLowerCase().includes('preview');

            if (isLikelyMarkdownPreview) {
              await vscode.window.tabGroups.close(tab);
            }
          }
        }
      }
      // 聚焦回源文件
        await vscode.window.showTextDocument(uri, {
          preserveFocus: false,
          viewColumn: viewColumn,
        });
    })
  );
}

export function deactivate() {}

async function waitUntilMarkdownPreviewOpened(timeout = 1000): Promise<boolean> {
  const start = Date.now();
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const found = vscode.window.tabGroups.all.some(group =>
        group.tabs.some(tab =>
          (tab.input as any)?.viewType?.includes('markdown.preview') ||
          tab.label.toLowerCase().includes('preview')
        )
      );

      const elapsed = Date.now() - start;

      if (found || elapsed > timeout) {
        clearInterval(interval);
        resolve(found);
      }
    }, 50);
  });
}
