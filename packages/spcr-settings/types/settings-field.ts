export interface ISettingsFieldHidden {
    type: "hidden",
    defaultValue: any,
}

export interface ISettingsFieldInput {
    type: "input",
    description?: string,
    defaultValue: any,
    callback?: (newValue?: string) => void,
    events?: Partial<React.InputHTMLAttributes<HTMLInputElement>>,
}

export interface ISettingsFieldDropdown {
    type: "dropdown",
    description?: string,
    defaultValue: string,
    options: string[],
    callback?: (newValue?: string) => void,
}

export interface ISettingsFieldButton {
    type: "button",
    description?: string,
    defaultValue: any,
    callback?: (newValue?: unknown) => void,
}

export interface ISettingsFieldGenericToggle {
    type: "toggle",
    description?: string,
    defaultValue: boolean,
    callback?: (newValue?: boolean) => void,
}

export type ISettingsField = ISettingsFieldHidden
    | ISettingsFieldDropdown
    | ISettingsFieldInput
    | ISettingsFieldButton
    | ISettingsFieldGenericToggle;

export type NewValueTypes = boolean | string;
