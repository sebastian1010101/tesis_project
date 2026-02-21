import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export default function Card({ children, className, ...rest }: CardProps) {
  const cls = ["ui-card", className].filter(Boolean).join(" ");
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}
