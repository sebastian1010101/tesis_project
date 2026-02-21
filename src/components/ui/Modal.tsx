import type { ReactNode } from "react";
import Button from "./Button";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose?: () => void;
  children: ReactNode;
};

export default function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="ui-modal__backdrop" onMouseDown={onClose}>
      <div
        className="ui-modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="ui-modal__header">
          <div className="ui-modal__title">{title}</div>
          {onClose ? (
            <Button variant="ghost" type="button" onClick={onClose}>
              Cerrar
            </Button>
          ) : null}
        </div>
        <div className="ui-modal__body">{children}</div>
      </div>
    </div>
  );
}
