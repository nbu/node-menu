declare namespace NodeMenu {
    interface args {
        name: string;
        type: 'numeric' | 'bool' | 'string';
    }
}

interface NodeMenuInstance {
    enableDefaultHeader(): NodeMenuInstance;
    disableDefaultHeader(): NodeMenuInstance;
    customHeader(customHeaderFunc: Function): NodeMenuInstance;
    enableDefaultPrompt(): NodeMenuInstance;
    disableDefaultPrompt(): NodeMenuInstance;
    customPrompt(customPromptFunc: Function): NodeMenuInstance;
    resetMenu(): NodeMenuInstance;
    continueCallback(continueCallback: Function): NodeMenuInstance;
    addItem(title: string, handler: Function, owner?: any, args?: NodeMenu.args[]): NodeMenuInstance;
    addDelimiter(delimiter: string, cnt: number, title?: string): NodeMenuInstance;
    start(): void;
}

declare const NodeMenu: NodeMenuInstance;
export = NodeMenu;
