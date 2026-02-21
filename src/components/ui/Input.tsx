import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input(props: InputProps) {
  const { className, ...rest } = props;
  const cls = ["ui-input", className].filter(Boolean).join(" ");
  return <input className={cls} {...rest} />;
}
