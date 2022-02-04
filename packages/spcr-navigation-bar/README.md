# Navigation Bar Plugin
#### Supports custom apps
Easily add navigation bars to your custom apps


## Getting Started
1. Create a [Spicetify Creator](https://github.com/FlafyDev/spicetify-creator) project
2. `yarn add spcr-navigation-bar`

## Preview
![Preview](./previewImage.png)  
```tsx
app.tsx

import React, { useEffect } from 'react';
import useNavigationBar from 'spcr-navigation-bar';

const App = () => {
  // Create the React Hook for the Navigation Bar
  const [navBar, activeLink, setActiveLink] = useNavigationBar(["Page 1", "Page 2", "Page 3", "Page 4", "Page 5"]);

  // Start on Page 2
  useEffect(() => {
    setActiveLink("Page 2");
  }, []);

  return <>
    <div>{"You're currently on page: " + activeLink}</div> {/* Show which page you're on */}
    <button style={{color: 'black'}} onClick={() => setActiveLink("Page 3")}>{"go to page 3"}</button> {/* A button which redirects to "Page 3" */}
    {navBar} {/* Must add the navBar element to anywhere in the DOM */}
  </>
}

export default App;

```
