import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
};

export default function Modal({ open, children }: ModalProps) {
  if (!open) return null;
  return <div>{children}</div>;
}
