---
title: my hello page title
description: my hello page description
hide_table_of_contents: false
---

export const Highlight = ({children, color}) => (
  <span
  onClick={() => alert(1)}
    style={{
      backgroundColor: color,
      borderRadius: '2px',
      color: '#fff',
      padding: '0.2rem',
    }}>
    {children}
  </span>
);

# Hello

How are you?
```jsx
<Highlight color="#25c2a0">Docusaurus green</Highlight>
```

:::tip
In practice, those are not really HTML elements, but React JSX elements, which we'll cover next!
:::

asdf