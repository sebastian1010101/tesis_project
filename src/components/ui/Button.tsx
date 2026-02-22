import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

function classForVariant(variant: ButtonVariant) {
  switch (variant) {
    case "primary":
      return "ui-btn ui-btn--primary";
    case "secondary":
      return "ui-btn ui-btn--secondary";
    case "ghost":
      return "ui-btn ui-btn--ghost";
    case "danger":
      return "ui-btn ui-btn--danger";
    case "success":
      return "ui-btn ui-btn--success";
  }
}

export default function Button(props: ButtonProps) {
  const { variant = "primary", className, ...rest } = props;
  const cls = [classForVariant(variant), className].filter(Boolean).join(" ");
  return <button className={cls} {...rest} />;
}
