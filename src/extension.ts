import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Initialising TODO extension.');

	const disposable = vscode.commands.registerCommand('todoNavigator.findTasks', async () => {
		const editor = vscode.window.activeTextEditor;
		// const file = editor.
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
		if (editor.options.insertSpaces) {
			const rawTabSize = editor.options.tabSize;
			const tabSize = parseInt(rawTabSize as string, 10) || 4;
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
				vscode.window.showInformationMessage('Unable to do that bruh.');
				return;
			}
		} catch (error) {
			vscode.window.showErrorMessage('Something went wrong. Try again');
			console.log(error);
			return;
		}
	});

	context.subscriptions.push(disposable);
}


export function deactivate() { }
