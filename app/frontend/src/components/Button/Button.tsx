import React from "react";
import classNames from "classnames";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className,
  children,
  ...rest
}) => {
  return (
    <button
      className={classNames(
        styles.button,
        variant === "secondary" && styles.secondary,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
