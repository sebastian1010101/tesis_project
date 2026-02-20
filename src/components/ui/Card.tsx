import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export default function Card({ children, ...rest }: CardProps) {
  return <div {...rest}>{children}</div>;
}
