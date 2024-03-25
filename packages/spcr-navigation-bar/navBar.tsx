import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom';
import OptionsMenu from './optionsMenu';
import styles from './navBar.module.scss'

export class NavbarItem {
  constructor(public link: string, public isActive: boolean) { }
}

export {styles}

export type SelectLinkCallbackType = (link: string) => void

const NavbarItemComponent = (props: { item: NavbarItem, switchTo: SelectLinkCallbackType }) => {
  return <li className={styles.topBarHeaderItem} onClick={(e) => {
    e.preventDefault();
    props.switchTo(props.item.link);
  }}
  >
    <a className={`${styles.topBarHeaderItemLink} ${props.item.isActive ? styles.topBarActive : ""}`}
      aria-current={"page"} draggable={false} href={""}
    >
      <span className={"main-type-mestoBold"}>
        {props.item.link}
      </span>
    </a>
  </li>;
}

const NavbarMore = React.memo<{ items: NavbarItem[], switchTo: SelectLinkCallbackType }>(({ items, switchTo }) => {
  return <li className={`${styles.topBarHeaderItem} ${items.find(item => item.isActive) ? styles.topBarActive : ""}`}>
    <OptionsMenu options={items} onSelect={switchTo} defaultValue={"More"} bold={true} />
  </li>
});

const NavbarContent = (props: { links: string[], activeLink: string, switchCallback: SelectLinkCallbackType }) => {
  const resizeHost = (document.querySelector<HTMLDivElement>(".Root__main-view .os-resize-observer-host") ?? document.querySelector<HTMLDivElement>(".Root__main-view .os-size-observer"))!;
  const [windowSize, setWindowSize] = useState(resizeHost.clientWidth);
  const resizeHandler = () => setWindowSize(resizeHost.clientWidth);

  useEffect(() => {
    const observer = new ResizeObserver(resizeHandler);
    observer.observe(resizeHost);
    return () => {
      observer.disconnect();
    };
  }, [resizeHandler]);

  return <NavbarContext>
    <Navbar {...props} windowSize={windowSize} />
  </NavbarContext>
};

const NavbarContext = (props: { children?: React.ReactNode }) => {
  return ReactDOM.createPortal(
    <div className={"main-topbar-topbarContent"}>
      {props.children}
    </div>,
    document.querySelector<HTMLDivElement>(".main-topBar-topbarContentWrapper")!
  );
};

const Navbar = (props: { links: string[], activeLink: string, switchCallback: SelectLinkCallbackType, windowSize: number }) => {
  const navBarListRef = React.useRef<HTMLUListElement>(null);
  const [childrenSizes, setChildrenSizes] = useState<number[]>([]);
  const [availableSpace, setAvailableSpace] = useState<number>(0);
  const [outOfRangeItemIndexes, setOutOfRangeItemIndexes] = useState<number[]>([]);
  let items = props.links.map(link => new NavbarItem(link, link === props.activeLink));

  useEffect(() => {
    if (!navBarListRef.current) return;

    const children = Array.from(navBarListRef.current.children);
    const navBarItemSizes = children.map(child => child.clientWidth);

    setChildrenSizes(navBarItemSizes);
  }, []);

  useEffect(() => {
    if (!navBarListRef.current) return;
    setAvailableSpace(navBarListRef.current.clientWidth);
  }, [props.windowSize]);

  useEffect(() => {
    if (!navBarListRef.current) return;

    let totalSize = childrenSizes.reduce((a, b) => a + b, 0);

    // Can we render everything?
    if (totalSize <= availableSpace) {
      setOutOfRangeItemIndexes([]);
      return;
    }

    // The `More` button can be set to _any_ of the children. So we
    // reserve space for the largest item instead of always taking
    // the last item.
    const viewMoreButtonSize = Math.max(...childrenSizes);

    // Figure out how many children we can render while also showing
    // the More button
    const itemsToHide: number[] = [];
    let stopWidth = viewMoreButtonSize;

    childrenSizes.forEach((childWidth, i) => {
      if (availableSpace >= stopWidth + childWidth) {
        stopWidth += childWidth;
      } else if (i !== items.length) {
        itemsToHide.push(i);
      }
    });

    setOutOfRangeItemIndexes(itemsToHide);
  }, [availableSpace, childrenSizes]);

  return <nav className={styles.topBarNav}>
    <ul className={styles.topBarHeader} ref={navBarListRef}>
      {items.filter((_, id) => !outOfRangeItemIndexes.includes(id)).map(item =>
        <NavbarItemComponent item={item} switchTo={props.switchCallback} />
      )}
      {outOfRangeItemIndexes.length ? <NavbarMore items={outOfRangeItemIndexes.map(i => items[i])} switchTo={props.switchCallback} /> : null}
    </ul>
  </nav>
};

export default NavbarContent
