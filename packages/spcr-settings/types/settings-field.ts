export interface ISettingsField {
    type: "button" | "toggle" | "input" | "dropdown" | "hidden",
    description?: string,
    defaultValue: any,
    options?: string[],
    callback?: (newValue?: NewValueTypes) => void,
    /** The following events are only emitted when 'type' is input */
    keyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void,
    blur?: (event: React.FocusEvent<HTMLInputElement, Element>) => void,
}

export type NewValueTypes = boolean | string;
