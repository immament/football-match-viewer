import { MouseEvent, useCallback, useEffect, useMemo, useRef } from "react";

export type PopupMenuItem<T extends string | number = string> =
  | PopupMenuLink<T>
  | PopupMenuSeparator;

export type PopupMenuLink<T extends string | number = string> = {
  title: string;
  value: T;
  selected?: boolean;
  type?: undefined;
  disabled?: boolean;
};
export type PopupMenuSeparator = { type: "separator" };

export function PopupMenu<T extends string | number = string>({
  title,
  currentValue,
  items,
  visible,
  onBlur,
  onItemSelected,
}: {
  title?: string;
  currentValue: T;
  items: PopupMenuItem<T>[];
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
        {items.map((item, index) =>
          item.type === "separator" ? (
            <div className="mv-menuitem-separator" key={"s-" + index} />
          ) : (
            <div
              className={
                "mv-menuitem" +
                (currentValue === item.value ? " mv-menuitem-selected" : "") +
                (item.disabled ? " mv-menuitem-disabled" : "")
              }
              key={item.value}
              onClick={(ev) => !item.disabled && itemClicked(ev, item.value)}
            >
              {item.title}
            </div>
          )
        )}
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
      {title && <div className="mv-menuheader">{title}</div>}
      <div className="mv-menucontent">{menuContent}</div>
    </div>
  );
}
