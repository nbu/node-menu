declare namespace NodeMenu {
    interface args {
        name: string,
        type: 'numeric'|'bool'|'string'
    }
}

declare class NodeMenu {
    constructor();
    enableDefaultHeader(): NodeMenu;
    disableDefaultHeader(): NodeMenu;
    customHeader(customHeaderFunc: Function): NodeMenu;
    enableDefaultPrompt(): NodeMenu;
    disableDefaultPrompt(): NodeMenu;
    customPrompt(customPromptFunc: Function): NodeMenu;
    resetMenu(): NodeMenu;
    continueCallback(continueCallback: Function): NodeMenu;
    addItem(title: string, handler: Function, owner?: any, args?: NodeMenu.args[]): NodeMenu;
    addDelimiter(delimiter: string, cnt: number, title?: string): NodeMenu;
    start(): void;
}
export = NodeMenu;