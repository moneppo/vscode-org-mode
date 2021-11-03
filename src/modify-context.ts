import * as vscode from 'vscode';
import getCursorContext, { DATE, TODO, CHECKBOX } from './cursor-context';
import * as Datetime from './simple-datetime';
import nextTodo from './todo-switch';

export const UP = "UP";
export const DOWN = "DOWN";

// If any new contexts are created (Such as TODO), switch for the dataLabel here
function modifyContext(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, action: string) {
    const ctx = getCursorContext(textEditor, edit);

    const checkboxStates = [' ', 'X', 'O', '/', '<', '>', 'V', '-'];

    if (!ctx) {
        vscode.window.showErrorMessage("No context to modify");
        return;
    }

    switch (ctx.dataLabel) {
        case DATE:
            const newDateString = Datetime.modifyDate(ctx.data, action);
            edit.replace(ctx.range, newDateString);
            break;
        case TODO:
            const newTodoString = nextTodo(ctx.data, action);
            if (newTodoString === "") {
                // Must remove extra space
                const oldEnd = ctx.range.end
                const newEnd = oldEnd.with({ character: oldEnd.character + 1 });
                const oldRange = ctx.range;
                ctx.range = oldRange.with({ end: newEnd });
            }
            edit.replace(ctx.range, newTodoString);
            break;
        case CHECKBOX:
            const index = checkboxStates.indexOf(ctx.data.toUpper());
            const newState = index !== -1 ? checkboxStates[(index + 1) % checkboxStates.length] : " ";
            edit.replace(ctx.range, newState);
    }
}

export function incrementContext(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    modifyContext(textEditor, edit, UP);
}

export function decrementContext(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    modifyContext(textEditor, edit, DOWN);
}