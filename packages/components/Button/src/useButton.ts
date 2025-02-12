import * as React from 'react';
import { useAsPressable, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { ButtonProps, ButtonState } from './Button.types';
import { memoize } from '@fluentui-react-native/framework';
import { AccessibilityState } from 'react-native';

export const useButton = (props: ButtonProps): ButtonState => {
  // attach the pressable state handlers
  const defaultComponentRef = React.useRef(null);
  const { onClick, accessibilityState, componentRef = defaultComponentRef, disabled, loading, ...rest } = props;
  // GH #1336: Set focusRef to null if button is disabled to prevent getting keyboard focus.
  const focusRef = disabled ? null : componentRef;
  const onClickWithFocus = useOnPressWithFocus(focusRef, onClick);
  const pressable = useAsPressable({ ...rest, onPress: onClickWithFocus });
  const onKeyUpProps = useKeyProps(onClick, ' ', 'Enter');
  const isDisabled = !!disabled || !!loading;
  const hasTogglePattern = props.accessibilityActions && !!props.accessibilityActions.find((action) => action.name === 'Toggle');

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityRole: 'button',
      onAccessibilityTap: props.onAccessibilityTap || (!hasTogglePattern ? props.onClick : undefined),
      accessibilityLabel: props.accessibilityLabel,
      accessibilityState: getAccessibilityState(isDisabled, accessibilityState),
      enableFocusRing: true,
      focusable: !isDisabled,
      ref: useViewCommandFocus(componentRef),
      ...onKeyUpProps,
      iconPosition: props.iconPosition || 'before',
      loading,
    },
    state: pressable.state,
  };
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean, accessibilityState?: AccessibilityState) {
  if (accessibilityState) {
    return { disabled: disabled, ...accessibilityState };
  }
  return { disabled: disabled };
}
