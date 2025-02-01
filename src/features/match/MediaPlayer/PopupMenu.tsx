import { MouseEvent, useCallback, useEffect, useMemo, useRef } from "react";

export type PopumMenuItem<T extends string | number = string> = {
  title: string;
  value: T;
  selected?: boolean;
};

export function PopupMenu<T extends string | number = string>({
  title,
  currentValue,
  items,
  visible,
  onBlur,
  onItemSelected,
}: {
  title: string;
  currentValue: T;
  items: PopumMenuItem<T>[];
  visible: boolean;
  onBlur: () => void;
  onItemSelected: (value: T) => void;
}) {
  const _menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) _menuRef.current?.focus();
  }, [visible]);

  const itemClicked = useCallback(
    (ev: MouseEvent, value: T) => {
      ev.stopPropagation();
      onItemSelected(value);
    },
    [onItemSelected]
  );

  const menuContent = useMemo(() => {
    return (
      <>
        {items.map(({ title, value }) => (
          <div
            className={
              "mv-menuitem" +
              (currentValue === value ? " mv-menuitem-selected" : "")
            }
            key={value}
            onClick={(ev) => itemClicked(ev, value)}
          >
            {title}
          </div>
        ))}
      </>
    );
  }, [currentValue, itemClicked, items]);

  return (
    <div
      className="mv-popup-menu"
      onBlur={onBlur}
      ref={_menuRef}
      tabIndex={-1}
      style={{ display: visible ? "block" : "none" }}
    >
      <div className="mv-menuheader">{title}</div>
      <div className="mv-menucontent">{menuContent}</div>
    </div>
  );
}
