import React from "react";
import { TextArea, ITextAreaProps } from "native-base";

interface CustomTextAreaProps extends Partial<ITextAreaProps> {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  h?: number;
}

export const CustomTextArea = React.forwardRef<any, CustomTextAreaProps>(
  (props, ref) => {
    const baseProps = {
      w: "100%",
      autoCompleteType: undefined,
      onTextInput: () => {},
      tvParallaxProperties: {},
      ...props,
    };

    return <TextArea {...baseProps} ref={ref} />;
  }
);
