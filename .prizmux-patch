# Prizmux Library - Theme Support Patch Guide

To make the Prizmux library fully compatible with dynamic themes (Light/Dark mode), the following changes should be applied to the library source code.

## Core Recommendation for All Components
- **Prop Extension**: Every component should accept an optional `style` (ViewStyle) and `textStyle` (TextStyle) prop.
- **Color Props**: Components with specific background or text elements should accept `backgroundColor`, `titleColor`, and `textColor` props.
- **Icon Theming**: Any internal icons should accept a `color` prop passed from the parent.

---

## 1. Alert (`components/Alert`)
- **Modify**: `Alert.js` & `Alert.types.d.ts`
- **Issue**: Title and Message colors are hardcoded (`#111827`, `#6B7280`).
- **Fix**: Add `titleStyle` and `messageStyle` props. Use them in the `Text` components.

## 2. BottomSheet (`components/BottomSheet`)
- **Modify**: `BottomSheet.js` & `BottomSheet.types.d.ts`
- **Issue**: Background is hardcoded to `#FFFFFF`. Title and Drag handle colors are hardcoded.
- **Fix**: (Already patched in current workspace) Add `backgroundColor`, `titleStyle`, and `handleStyle` props.

## 3. Button (`components/Button`)
- **Modify**: `Button.js`
- **Issue**: Default variants use hardcoded blue (`#3B82F6`).
- **Fix**: Allow `backgroundColor` and `color` to be passed through props to override the default variant colors.

## 4. ContextMenu (`components/ContextMenu`)
- **Modify**: `ContextMenu.js`
- **Issue**: Menu background and item text colors are hardcoded.
- **Fix**: Add `menuStyle` and `itemTextStyle` props.

## 5. EmptyState (`components/EmptyState`)
- **Modify**: `EmptyState.js`
- **Issue**: Title and Description colors are hardcoded.
- **Fix**: Add `titleStyle` and `descriptionStyle` props.

## 6. FAB (`components/Fab`)
- **Modify**: `Fab.js`
- **Issue**: Background defaults to blue (`#3B82F6`).
- **Fix**: Integrate with a `color` or `backgroundColor` prop.

## 7. Header (`components/Header`)
- **Modify**: `Header.js` & `Header.types.d.ts`
- **Issue**: Background, title, and back button colors are hardcoded.
- **Fix**: (Already patched in current workspace) Add `backgroundColor`, `titleStyle`, `backButtonStyle`, and `backIconStyle`.

## 8. PhoneInput (`components/PhoneInput`)
- **Modify**: `PhoneInput.js`
- **Issue**: Heavy use of hardcoded grays (`#F3F4F6`, `#E5E7EB`, `#F9FAFB`) for inputs and the country selector.
- **Fix**: 
    - Add `inputStyle`, `containerStyle`, and `labelStyle` props.
    - Expose `modalStyle` for the country picker background to support dark mode.

## 9. Toast (`components/Toast`)
- **Modify**: `Toast.js`
- **Issue**: Success/Error backgrounds are hardcoded.
- **Fix**: Allow `style` and `textStyle` overrides.

---

## Implementation Tip:
Instead of hardcoding colors like `backgroundColor: '#FFFFFF'`, use a conditional or prop-based approach:
```javascript
const finalBgColor = backgroundColor || (isDarkMode ? '#1A1A1A' : '#FFFFFF');
```
But the cleanest way is simply exposing the props so the developer using the library can pass their own theme variables.
