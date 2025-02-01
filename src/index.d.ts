declare global {
  namespace JSX {
    interface IntrinsicElements {
      "box-icon": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { name: string },
        HTMLElement
      >;
    }
  }
}
