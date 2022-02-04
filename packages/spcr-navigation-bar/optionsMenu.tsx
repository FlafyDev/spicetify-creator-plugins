import React from 'react'
import { NavbarItem, SelectLinkCallbackType, styles } from './navBar';

const OptionsMenuItemIcon = <svg width={16} height={16} viewBox={"0 0 16 16"} fill={"currentColor"}>
  <path d={"M13.985 2.383L5.127 12.754 1.388 8.375l-.658.77 4.397 5.149 9.618-11.262z"}>
  </path>
</svg>

const OptionsMenuItem = React.memo<{ onSelect: SelectLinkCallbackType, value: string, isSelected: boolean }>(props => {
  return <Spicetify.ReactComponent.MenuItem onClick={props.onSelect} icon={props.isSelected ? OptionsMenuItemIcon : null}>
    {props.value}
  </Spicetify.ReactComponent.MenuItem>
});

const OptionsMenu = React.memo<{ options: NavbarItem[], onSelect: SelectLinkCallbackType, defaultValue: any, bold: boolean }>(props => {
  const menuRef = React.useRef<HTMLButtonElement>(null);

  const menu = <Spicetify.ReactComponent.Menu>
    {props.options.map(option =>
      <OptionsMenuItem value={option.link} isSelected={option.isActive} onSelect={() => {
        props.onSelect(option.link);
        menuRef.current?.click();
      }} />
    )}
  </Spicetify.ReactComponent.Menu>

  return <Spicetify.ReactComponent.ContextMenu menu={menu} trigger={"click"} action={"toggle"} renderInLine={true}>
    <button className={styles.optionsMenuDropBox} ref={menuRef}>
      <span className={props.bold ? "main-type-mestoBold" : "main-type-mesto"}>
        {props.options.find(o => o.isActive)?.link || props.defaultValue}
      </span>
      <svg width={16} height={16} viewBox={"0 0 16 16"} fill={"currentColor"}>
        <path d={"M3 6l5 5.794L13 6z"}></path>
      </svg>
    </button>
  </Spicetify.ReactComponent.ContextMenu>
});

export default OptionsMenu;
