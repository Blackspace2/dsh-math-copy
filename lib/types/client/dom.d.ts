export interface MathInteractionController {
    dispose(): void;
    scan(root?: ParentNode): void;
}
export declare function writeClipboard(text: string): Promise<void>;
/** Install all DOM-level behavior. Returning dispose makes it safe under DSH HMR. */
export declare function installMathInteractions(): MathInteractionController;
