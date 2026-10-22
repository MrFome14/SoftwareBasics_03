import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Initialising TODO extension.');

	const disposable = vscode.commands.registerCommand('tryCatchHelper.wrapSelection', async () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			vscode.window.showInformationMessage('No editor opened');
			return;
		}

		const document = editor.document;
		const selected = editor.selection;

		if (selected.isEmpty) {
			vscode.window.showInformationMessage('Nothing selected');
			return;
		}

		const firstLine = selected.start.line;
		let lastLine = selected.end.line;

		if (selected.end.character === 0 && lastLine > firstLine) {
			--lastLine;
		}

		const selectedRagle = new vscode.Range(
			firstLine, 0,
			lastLine, document.lineAt(lastLine).text.length
		);


		let indent = "\t";
		let tabSize = 4;
		if (editor.options.insertSpaces) {
			const rawTabSize = editor.options.tabSize;
			if (typeof rawTabSize == "number") {
				tabSize = rawTabSize;
			}
			indent = ' '.repeat(tabSize);
		}

		const text = document.getText(selectedRagle);
		const styledText = text.split('\n').map(line => indent + line).join('\n');
		const wrappedText = `try {\n${styledText}\n} catch (error) {\n${indent}console.error(error);\n}`

		try {
			const success = await editor.edit((editBuilder) => {
				editBuilder.replace(selectedRagle, wrappedText);
			});

			if (!success) {
				vscode.window.showInformationMessage('Unable to wrap the selected code.');
				return;
			}
		} catch (error) {
			vscode.window.showErrorMessage('Something went wrong. Try again');
			console.log(error);
			return;
		}

		const catchLine = document.lineAt(lastLine + 2);
		const logLine = document.lineAt(lastLine + 3);

		const catchIndex = catchLine.text.indexOf('error');
		const logIndex = logLine.text.indexOf('error)');

		editor.selections = [
			new vscode.Selection(
				catchLine.lineNumber, catchIndex,
				catchLine.lineNumber, catchIndex + 5
			),
			new vscode.Selection(
				logLine.lineNumber, logIndex,
				logLine.lineNumber, logIndex + 5
			)
		];
	});

	context.subscriptions.push(disposable);
}


export function deactivate() { }
