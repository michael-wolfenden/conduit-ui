import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import type { ComponentProps } from "react";

import { classNames } from "#app/lib/utils/classNames.ts";

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    TextAreaField,
  },
  formComponents: {},
});

type TextFieldProps = Omit<
  ComponentProps<"input">,
  "id" | "name" | "value" | "onBlur" | "onChange" | "className"
> & {
  variant?: "default" | "large";
};

function TextField({ variant, ...props }: TextFieldProps) {
  const field = useFieldContext<string>();

  return (
    <fieldset className="form-group">
      <input
        {...props}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={classNames("form-control", variant === "large" && "form-control-lg")}
      />
    </fieldset>
  );
}

type TextAreaFieldProps = Omit<
  ComponentProps<"textarea">,
  "id" | "name" | "value" | "onBlur" | "onChange" | "className"
> & {
  variant?: "default" | "large";
  withFieldset?: boolean;
};

function TextAreaField({ variant, withFieldset = true, ...props }: TextAreaFieldProps) {
  const field = useFieldContext<string>();
  const textarea = (
    <textarea
      {...props}
      id={field.name}
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      className={classNames("form-control", variant === "large" && "form-control-lg")}
    />
  );

  return withFieldset ? <fieldset className="form-group">{textarea}</fieldset> : textarea;
}
