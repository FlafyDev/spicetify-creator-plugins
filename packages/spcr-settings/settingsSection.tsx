import React, { useState } from 'react'
import ReactDOM from 'react-dom';
import styles from './settings.module.css'
import { ISettingsField, ISettingsFieldButton, ISettingsFieldDropdown, ISettingsFieldInput, ISettingsFieldToggle, NewValueTypes } from './types/settings-field';

class SettingsSection {
  settingsFields: { [nameId: string]: ISettingsField } = this.initialSettingsFields;
  private stopHistoryListener: any;
  private setRerender: Function | null = null;

  constructor(public name: string, public settingsId: string, public initialSettingsFields: { [key: string]: ISettingsField } = {}) {}

  pushSettings = async () => {
    Object.entries(this.settingsFields).forEach(([nameId, field]) => {
      if (field.type !== 'button' && this.getFieldValue(nameId) === undefined) {
        this.setFieldValue(nameId, field.defaultValue);
      }
    });

    while (!Spicetify?.Platform?.History?.listen) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  
    if (this.stopHistoryListener)
      this.stopHistoryListener();

    this.stopHistoryListener = Spicetify.Platform.History.listen((e: any) => {
      if (e.pathname === '/preferences') {
        this.render();
      }
    })
    
    if (Spicetify.Platform.History.location.pathname === '/preferences') {
      await this.render();
    }
  }

  rerender = () => {
    if (this.setRerender) {
      this.setRerender(Math.random());
    }
  }

  private render = async () => {
    while (!document.getElementById('desktop.settings.selectLanguage')) {
      if (Spicetify.Platform.History.location.pathname !== '/preferences') return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const allSettingsContainer = document.getElementsByClassName('x-settings-container')[0];
    let pluginSettingsContainer = Array.from(allSettingsContainer.children).find((child) => child.id === this.settingsId)
  
    if (!pluginSettingsContainer) {
      pluginSettingsContainer = document.createElement('div');
      pluginSettingsContainer.id = this.settingsId;
      pluginSettingsContainer.className = styles.settingsContainer;
      const spotifyVersion = this.getSpotifyVersion();
      let advancedOptionsButton: Element | undefined = undefined;
      let tries = 0;


      // Only loop until "show advanced settings" button is found if
      // spotify version < 1.1.80
      if (spotifyVersion >= 80) {
        allSettingsContainer.appendChild(pluginSettingsContainer);
      } else {
        while (true) {
          try {
            const buttons = allSettingsContainer.getElementsByClassName('x-settings-button');
            advancedOptionsButton = Array.from(buttons).find((button) => {
              return (button.children[0] as HTMLButtonElement)?.type === 'button';
            })
          } catch (e) {
            console.error("Error while finding \"show advanced settings\" button:", e);
          }

          if (advancedOptionsButton) break

          if (Spicetify.Platform.History.location.pathname !== '/preferences') {
            console.warn(`[spcr-settings] couldn't find "show advanced settings" button after ${tries} tries.`);
            return;
          }

          tries++;
          console.log("Couldn't find \"show advanced settings\" button. Trying again in 1000ms...");
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        allSettingsContainer.insertBefore(pluginSettingsContainer, advancedOptionsButton!);
      }
    } else {
      console.log(pluginSettingsContainer)
    }

    ReactDOM.render(<this.FieldsContainer />, pluginSettingsContainer)
  }
  
  addButton = (nameId: string, description: string, value: string, onClick?: () => void, events?: ISettingsFieldButton['events']) => {
    this.settingsFields[nameId] = {
      type: "button",
      description: description,
      value: value,
      events: {
        onClick: onClick,
        ...events,
      },
    };
  }

  addInput = (nameId: string, description: string, defaultValue: string, onChange?: () => void, events?: ISettingsFieldInput['events']) => {
    this.settingsFields[nameId] = {
      type: "input",
      description: description,
      defaultValue: defaultValue,
      events: {
        onChange: onChange,
        ...events,
      },
    };
  }

  addHidden = (nameId: string, defaultValue: any) => {
    this.settingsFields[nameId] = {
      type: "hidden",
      defaultValue: defaultValue,
    };
  }

  addToggle = (nameId: string, description: string, defaultValue: boolean, onChange?: () => void, events?: ISettingsFieldToggle['events']) => {
    this.settingsFields[nameId] = {
      type: "toggle",
      description: description,
      defaultValue: defaultValue,
      events: {
        onChange: onChange,
        ...events,
      }
    };
  }

  addDropDown = (nameId: string, description: string, options: string[], defaultIndex: number, onSelect?: () => void, events?: ISettingsFieldDropdown['events']) => {
    this.settingsFields[nameId] = {
      type: "dropdown",
      description: description,
      defaultValue: options[defaultIndex],
      options: options,
      events: {
        onSelect: onSelect,
        ...events,
      },
    };
  }

  getFieldValue = <Type,>(nameId: string): Type => {
    return JSON.parse(Spicetify.LocalStorage.get(`${this.settingsId}.${nameId}`) || "{}")?.value;
  }

  setFieldValue = (nameId: string, newValue: any) => {
    Spicetify.LocalStorage.set(`${this.settingsId}.${nameId}`, JSON.stringify({ value: newValue }));
  }

  private getSpotifyVersion = () => {
    // Version format is X.Y.Z, we are only interested in the Z value
    const stringVersion: string =
      Spicetify.Platform.PlatformData.client_version_triple;
    const splitVersion = stringVersion.split('.');
    const zValue = splitVersion[2];
    return parseInt(zValue);
  }

  private FieldsContainer = () => {
    const [rerender, setRerender] = useState<number>(0);
    this.setRerender = setRerender;

    return <div className={styles.settingsContainer} key={rerender}>
      <h2 className="main-shelf-title main-type-cello">{this.name}</h2>
      {Object.entries(this.settingsFields).map(([nameId, field]) => {
        return <this.Field nameId={nameId} field={field} />
      })}
    </div>
  }

  private Field = (props: { nameId: string, field: ISettingsField }) => {
    const id = `${this.settingsId}.${props.nameId}`;
    
    let defaultStateValue;
    if (props.field.type === "button") {
      defaultStateValue = props.field.value;
    } else {
      defaultStateValue = this.getFieldValue(props.nameId);
    }

    if (props.field.type === "hidden") {
      return <></>
    }

    const [value, setValueState] = useState(defaultStateValue);
    
    const setValue = (newValue?: any) => {
      if (newValue !== undefined) {
        setValueState(newValue);
        this.setFieldValue(props.nameId!, newValue);
      }
    }

    return <>
      <div className="main-type-mesto" style={{color: 'var(--spice-subtext)'}}><label htmlFor={id}>
        {props.field.description || ""}
      </label></div>
      <span className="x-settings-secondColumn">
        {
          props.field.type === 'input' ? 
            <input
              className="main-dropDown-dropDown"
              id={id}
              dir="ltr"
              value={value as string}
              type="text"
              {...props.field.events}
              onChange={(e) => {
                setValue(e.currentTarget.value);
                const onChange = (props.field as ISettingsFieldInput).events?.onChange
                if (onChange) onChange(e)
              }}
            /> :

          props.field.type === 'button' ? 
            <span className="">
              <button
                id={id}
                className="main-buttons-button main-button-outlined"
                {...props.field.events}
                onClick={(e) => {
                  setValue();
                  const onClick = (props.field as ISettingsFieldButton).events?.onClick
                  if (onClick) onClick(e)
                }}
                type="button"
              >
                {value}
              </button>
            </span> :

          props.field.type === 'toggle' ?
            <label className="x-toggle-wrapper x-settings-secondColumn">
              <input
                id={id}
                className="x-toggle-input"
                type="checkbox"
                checked={value as boolean}
                {...props.field.events}
                onClick={(e) => {
                  setValue(e.currentTarget.checked);
                  const onClick = (props.field as ISettingsFieldToggle).events?.onClick
                  if (onClick) onClick(e)
                }} 
              />
              <span className="x-toggle-indicatorWrapper">
                <span className="x-toggle-indicator">
                </span>
              </span>
            </label> :
          
          props.field.type === 'dropdown' ?
            <select
              className="main-dropDown-dropDown"
              id={id}
              {...props.field.events}
              onChange={(e) => {
                setValue((props.field as ISettingsFieldDropdown).options[e.currentTarget.selectedIndex]);
                const onChange = (props.field as ISettingsFieldDropdown).events?.onChange
                if (onChange) onChange(e)
              }}
            >
              {
                props.field.options.map((option, i) => {
                  return <option selected={option === value} value={i+1}>{option}</option>
                })
              }
            </select> : <></>
        }
      </span>
    </>
  }
}

export { SettingsSection };
