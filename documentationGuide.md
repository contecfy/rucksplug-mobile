# Prizmux Documentation Guide

Prizmux is a smooth and modern UI component library for React Native, designed for performance and aesthetics.

## Installation

```bash
npm install prizmux
# or
yarn add prizmux
```

### Peer Dependencies

Ensure you have the following installed in your React Native project:

- `react >= 16.8.0`
- `react-native >= 0.60.0`

---

## Components

### 1. Alert

A customizable, animated modal alert for critical information or custom interactions.

#### Props

| Prop                     | Type         | Default   | Description                              |
| :----------------------- | :----------- | :-------- | :--------------------------------------- |
| `visible`                | `boolean`    | -         | Controls alert visibility.               |
| `onClose`                | `() => void` | -         | Callback when the alert is dismissed.    |
| `title`                  | `string`     | -         | Alert title.                             |
| `message`                | `string`     | -         | Alert message.                           |
| `icon`                   | `ReactNode`  | -         | Optional icon displayed above the title. |
| `children`               | `ReactNode`  | -         | Custom content (buttons, inputs, etc.).  |
| `dismissOnBackdropPress` | `boolean`    | `true`    | Close when clicking background.          |
| `borderRadius`           | `number`     | `16`      | Corner radius of the alert box.          |
| `backgroundColor`        | `string`     | `#FFFFFF` | Background color of the alert box.       |
| `style`                  | `ViewStyle`  | -         | Custom style for the alert box.          |

#### Usage

```tsx
import { Alert, Button } from 'prizmux';

<Alert
  visible={visible}
  onClose={() => setVisible(false)}
  title="Discard Changes?"
  message="You have unsaved changes. Are you sure you want to leave?"
>
  <Button title="Cancel" variant="outline" onPress={...} />
  <Button title="Discard" onPress={...} />
</Alert>
```

---

### 2. BottomSheet

A smooth, swipeable bottom sheet for selecting options or showing additional content.

#### Props

| Prop                    | Type         | Default | Description                             |
| :---------------------- | :----------- | :------ | :-------------------------------------- |
| `visible`               | `boolean`    | -       | Controls sheet visibility.              |
| `onClose`               | `() => void` | -       | Callback when the sheet is closed.      |
| `title`                 | `string`     | -       | Sheet header title.                     |
| `children`              | `ReactNode`  | -       | Content to display inside the sheet.    |
| `dismissOnTouchOutside` | `boolean`    | `true`  | Close when touching the backdrop.       |
| `showDragHandle`        | `boolean`    | `true`  | Display the top drag indicator.         |
| `swipeToClose`          | `boolean`    | `true`  | Enable vertical swipe-to-close gesture. |

#### Usage

```tsx
import { BottomSheet } from "prizmux";

<BottomSheet
  visible={isOpen}
  onClose={() => setOpen(false)}
  title="Select Action"
>
  <Text>Choose an option below...</Text>
</BottomSheet>;
```

---

### 3. Button

Versatile button component with support for loading states, icons, and variants.

#### Props

| Prop           | Type                             | Default    | Description                             |
| :------------- | :------------------------------- | :--------- | :-------------------------------------- |
| `title`        | `string`                         | -          | Button label text.                      |
| `onPress`      | `() => void`                     | -          | Click handler.                          |
| `variant`      | `'filled' \| 'outline'`          | `'filled'` | Visual style variant.                   |
| `size`         | `'small' \| 'medium' \| 'large'` | `'medium'` | Predefined sizing.                      |
| `isLoading`    | `boolean`                        | `false`    | Shows a loading indicator.              |
| `disabled`     | `boolean`                        | `false`    | Disables interaction & dims color.      |
| `icon`         | `ReactNode`                      | -          | Supporting icon.                        |
| `iconPosition` | `'left' \| 'right'`              | `'left'`   | Icon placement relative to text.        |
| `fullWidth`    | `boolean`                        | `false`    | Take up 100% width of parent.           |
| `borderRadius` | `number`                         | `0`        | (Legacy default 12) Overridable radius. |

#### Usage

```tsx
import { Button } from "prizmux";

<Button
  title="Submit"
  onPress={handleSubmit}
  isLoading={loading}
  icon={<Icon name="send" />}
/>;
```

---

### 4. Card

A simple wrapper component with standard elevation and padding.

#### Props

| Prop       | Type        | Default | Description                            |
| :--------- | :---------- | :------ | :------------------------------------- |
| `children` | `ReactNode` | -       | Card content.                          |
| `style`    | `ViewStyle` | -       | Custom styling (padding, color, etc.). |

#### Usage

```tsx
import { Card } from "prizmux";

<Card>
  <Text>This is inside a card with elevation.</Text>
</Card>;
```

---

### 5. ContextMenu

A floating menu for quick actions, typically triggered by long-press or icons.

#### Props

| Prop        | Type                                          | Default                | Description                                    |
| :---------- | :-------------------------------------------- | :--------------------- | :--------------------------------------------- |
| `visible`   | `boolean`                                     | -                      | Visibility control.                            |
| `onClose`   | `() => void`                                  | -                      | Close callback.                                |
| `items`     | `ContextMenuItem[]`                           | -                      | List of menu items (id, title, icon, onPress). |
| `position`  | `object`                                      | `{top: 40, right: 16}` | Absolute position on screen.                   |
| `animation` | `'fade' \| 'scale' \| 'fade-scale' \| 'none'` | `'fade-scale'`         | Entry/exit animation.                          |

#### Usage

```tsx
const items = [
  { id: "1", title: "Edit", icon: <EditIcon />, onPress: () => {} },
  { id: "2", title: "Delete", icon: <DeleteIcon />, onPress: () => {} },
];

<ContextMenu visible={show} onClose={() => setShow(false)} items={items} />;
```

---

### 6. EmptyState

Consistent UI for empty or zero-state screens.

#### Props

| Prop          | Type        | Default | Description                           |
| :------------ | :---------- | :------ | :------------------------------------ |
| `title`       | `string`    | -       | Main heading.                         |
| `description` | `string`    | -       | Supporting subtext.                   |
| `icon`        | `ReactNode` | -       | Illustration or icon.                 |
| `action`      | `ReactNode` | -       | Any component (e.g., Button) for CTA. |

#### Usage

```tsx
<EmptyState
  title="No Messages"
  description="You haven't received any messages yet."
  icon={<MessageIcon />}
  action={<Button title="Send First Message" onPress={...} />}
/>
```

---

### 7. FAB (Floating Action Button)

A primary action button that hovers over content.

#### Props

| Prop       | Type                             | Default          | Description                  |
| :--------- | :------------------------------- | :--------------- | :--------------------------- |
| `onPress`  | `() => void`                     | -                | Handler.                     |
| `icon`     | `ReactNode`                      | -                | Icon inside the FAB.         |
| `label`    | `string`                         | -                | Optional text (extends FAB). |
| `position` | `FABPosition`                    | `'bottom-right'` | Screen placement.            |
| `size`     | `'small' \| 'medium' \| 'large'` | `'medium'`       | Diameter control.            |
| `loading`  | `boolean`                        | `false`          | Shows spinner.               |

#### Usage

```tsx
<FAB icon={<AddIcon />} onPress={() => {}} />
<FAB icon={<AddIcon />} label="New Post" onPress={() => {}} />
```

---

### 8. Header

A standard screen header with support for back buttons, avatars, and actions.

#### Props

| Prop            | Type                            | Default    | Description                             |
| :-------------- | :------------------------------ | :--------- | :-------------------------------------- |
| `title`         | `string`                        | -          | Screen title.                           |
| `showBack`      | `boolean`                       | `false`    | Display back arrow.                     |
| `avatar`        | `ReactNode`                     | -          | Profile image or component.             |
| `actions`       | `HeaderAction[]`                | -          | List of icons with badges and handlers. |
| `titlePosition` | `'left' \| 'center' \| 'right'` | `'center'` | Text alignment.                         |

#### Usage

```tsx
<Header
  title="Dashboard"
  showBack
  actions={[{ icon: <BellIcon />, onPress: () => {}, badge: 5 }]}
/>
```

---

### 9. ImagePreview

A full-screen, high-performance image viewer with paging and gesture support.

#### Props

| Prop           | Type                 | Default | Description              |
| :------------- | :------------------- | :------ | :----------------------- |
| `visible`      | `boolean`            | -       | Visibility.              |
| `images`       | `string \| string[]` | -       | One or many URIs.        |
| `initialIndex` | `number`             | `0`     | Starting image index.    |
| `onClose`      | `() => void`         | -       | Close handler.           |
| `title`        | `string`             | -       | Image title/header text. |

#### Usage

```tsx
<ImagePreview
  visible={isOpen}
  images={["https://.../img1.png", "https://.../img2.png"]}
  onClose={() => setOpen(false)}
/>
```

---

### 10. PhoneInput

A sophisticated international phone number input with built-in country selector.

#### Props

| Prop                 | Type              | Default | Description                    |
| :------------------- | :---------------- | :------ | :----------------------------- |
| `value`              | `PhoneInputValue` | -       | `{ country, number, full }`    |
| `onChange`           | `(val) => void`   | -       | Change handler.                |
| `defaultCountryCode` | `string`          | `'US'`  | ISO code (e.g., 'UG', 'GB').   |
| `allowedCountries`   | `string[]`        | -       | Restrict to certain countries. |
| `error`              | `string`          | -       | Validation error message.      |

#### Usage

```tsx
<PhoneInput
  label="Phone Number"
  onChange={(val) => console.log(val.full)}
  defaultCountryCode="UG"
/>
```

---

### 11. Toast

Lightweight notifications that slide in from top or bottom.

#### Props

| Prop          | Type                                          | Default  | Description         |
| :------------ | :-------------------------------------------- | :------- | :------------------ |
| `visible`     | `boolean`                                     | -        | Visibility.         |
| `text`        | `string`                                      | -        | Main message.       |
| `description` | `string`                                      | -        | Sub-message.        |
| `type`        | `'success' \| 'error' \| 'info' \| 'warning'` | `'info'` | Color palette.      |
| `position`    | `'top' \| 'bottom'`                           | `'top'`  | Screen side.        |
| `dismiss`     | `'auto' \| 'manual' \| 'both'`                | `'auto'` | Dismissal behavior. |
| `duration`    | `number`                                      | `3000`   | Display time in ms. |

#### Usage

```tsx
<Toast
  visible={show}
  text="Success!"
  description="File uploaded successfully."
  type="success"
  onHide={() => setShow(false)}
/>
```

---

## Theme & Styling

Most components allow full style overrides via `style`, `textStyle`, and other custom style props. They use standard React Native `ViewStyle` and `TextStyle`.
