import React, { useState } from 'react'
import ReactDOM from 'react-dom';
import styles from './settings.module.css'

class SettingsSection {
  settingsFields: {[nameId: string]: ISettingsField} = { };
  private stopHistoryListener: any;
  private setRerender: Function | null = null;

  constructor(public name: string, public settingsId: string) { }

  pushSettings = async () => {
    Object.entries(this.settingsFields).map(([nameId, field]) => {
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
    let pluginSettingsContainer: Element | null = null;
  
    for (let i = 0; i < allSettingsContainer.children.length; i++) {
      if (allSettingsContainer.children[i].id === this.settingsId) {
        pluginSettingsContainer = allSettingsContainer.children[i];
      }
    }
  
    if (!pluginSettingsContainer) {
      pluginSettingsContainer = document.createElement('div');
      pluginSettingsContainer.id = this.settingsId;
      pluginSettingsContainer.className = styles.settingsContainer;
      let advancedOptionsButton: Element | null = null;
      let tries = 0;

      // Loop until "show advanced settings" button is found.
      while (true) {
        try {
          const buttons = allSettingsContainer.getElementsByClassName('x-settings-button');
          for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].children[0]?.textContent?.toLowerCase().endsWith('advanced settings')) {
              advancedOptionsButton = buttons[i];
              break;
            }
          }
        } catch (e) {
          console.error("Error while finding \"show advanced settings\" button:", e);
        }
        
        if (advancedOptionsButton) break
        if (Spicetify.Platform.History.location.pathname !== '/preferences') {
          console.log(`Couldn't find \"show advanced settings\" button after ${tries} tries.`);
          return;
        }

        tries++;
        console.log("Couldn't find \"show advanced settings\" button. Trying again in 1000ms...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
  
      allSettingsContainer.insertBefore(pluginSettingsContainer, advancedOptionsButton!);
    } else {
      console.log(pluginSettingsContainer)
    }

    ReactDOM.render(<this.FieldsContainer />, pluginSettingsContainer)
  }
  
  addButton = (nameId: string, description: string, value: string, onClick?: () => void) => {
    this.settingsFields[nameId] = {
      type: "button",
      description: description,
      defaultValue: value,
      callback: onClick,
    };
  }

  addInput = (nameId: string, description: string, defaultValue: string, onChange?: () => void) => {
    this.settingsFields[nameId] = {
      type: "input",
      description: description,
      defaultValue: defaultValue,
      callback: onChange,
    };
  }

  addHidden = (nameId: string, defaultValue: any) => {
    this.settingsFields[nameId] = {
      type: "hidden",
      defaultValue: defaultValue,
    };
  }

  addToggle = (nameId: string, description: string, defaultValue: boolean, onInput?: () => void) => {
    this.settingsFields[nameId] = {
      type: "toggle",
      description: description,
      defaultValue: defaultValue,
      callback: onInput,
    };
  }

  addDropDown = (nameId: string, description: string, options: string[], defaultIndex: number, onSelect?: () => void) => {
    this.settingsFields[nameId] = {
      type: "dropdown",
      description: description,
      defaultValue: options[defaultIndex],
      callback: onSelect,
      options: options,
    };
  }

  getFieldValue = <Type,>(nameId: string): Type => {
    return JSON.parse(Spicetify.LocalStorage.get(`${this.settingsId}.${nameId}`) || "{}")?.value;
  }

  setFieldValue = (nameId: string, newValue: any) => {
    Spicetify.LocalStorage.set(`${this.settingsId}.${nameId}`, JSON.stringify({value:newValue}));
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

  private Field = (props: {nameId: string, field: ISettingsField}) => {
    const id = `${this.settingsId}.${props.nameId}`;
    
    let defaultStateValue;
    if (props.field.type === "button") {
      defaultStateValue = props.field.defaultValue;
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
      if (props.field.callback)
        props.field.callback();
    }

    return <>
      <div className="main-type-mesto" style={{color: 'var(--spice-subtext)'}}><label htmlFor={id}>
        {props.field.description || ""}
      </label></div>
      <span className="x-settings-secondColumn">
        {
          props.field.type === 'input' ? 
            <input className="main-dropDown-dropDown" id={id} dir="ltr" value={value as string} type={"text"} onChange={(e) => {
              setValue(e.currentTarget.value);
            }} /> :

          props.field.type === 'button' ? 
            <span className="">
              <button id={id} onClick={() => {
                setValue();
              }} className="main-buttons-button main-button-outlined" type="button">
                {value}
              </button>
            </span> :

          props.field.type === 'toggle' ?
            <label className="x-toggle-wrapper x-settings-secondColumn">
              <input id={id} className="x-toggle-input" type="checkbox" checked={value as boolean} onClick={(e) => {
                setValue(e.currentTarget.checked);
              }} />
              <span className="x-toggle-indicatorWrapper">
                <span className="x-toggle-indicator">
                </span>
              </span>
            </label> :
          
          props.field.type === 'dropdown' ?
            <select className="main-dropDown-dropDown" id={id} onChange={(e) => {
              setValue(props.field.options![e.currentTarget.selectedIndex])
            }}>
              {
                props.field.options!.map((option, i) => {
                  return <option selected={option === value} value={i+1}>{option}</option>
                })
              }
            </select> : <></>
        }
      </span>
    </>
  }


}

interface ISettingsField {
  type: "button" | "toggle" | "input" | "dropdown" | "hidden",
  description?: string,
  defaultValue: any,
  callback?: () => void,
  options?: string[],
}

export { SettingsSection };