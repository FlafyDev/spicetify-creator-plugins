export interface ISettingsField {
    type: "button" | "toggle" | "input" | "dropdown" | "hidden",
    description?: string,
    defaultValue: any,
    options?: string[],
    callback?: (newValue?: NewValueTypes) => void,
}

export type NewValueTypes = boolean | string;
