import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Initialising TODO extension.');

	const disposable = vscode.commands.registerCommand('todoNavigator.findTasks', async () => {
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

		const text = document.getText(selected);
		const styledText = text.split('\n').map(line => "    " + line).join('\n');

		// console.log(text);

		const wrappedText = `try {\n${styledText}\n} catch (error) {\n    console.error(error);\n}`

		const success = await editor.edit((editBuilder) => {
			editBuilder.replace(selected, wrappedText);
		});

		if (!success) {
			vscode.window.showInformationMessage('Something went wrong. Try again');
			return;
		}

	});

	context.subscriptions.push(disposable);
}


export function deactivate() { }
