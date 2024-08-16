<p align="center">
  <h1 align="center">3d tetris from scratch using webgl</h1>
</p>

---

<a href="https://github.com/unchanted/3dtetris">click to play game (google chrome recommended) </a>

---
<h2 align="center">screenshots</h2>

![](./ss/gamealpha.jpg)
<p align="center">
  <img src="./ss/camera.gif">
</p>

<h2 align="center">gameplay</h2>

    wasd or mouse drag on object: movement
    space: fast drop
    q: rotate 90 degrees around the y-xis
    e: rotate 90 degrees around the x-axis
    mouse wheel scroll: zoom in/out to the point of cursor 
    mouse wheel button drag: move camera position
    arrows or mouse drag: rotate camera perspective
---
<h2 align="center">options</h2>

    height: changes ground's length on z-axis and changes invisible walls' location based on it 
    width: changes ground's length on x-axis and changes invisible walls' location based on it 
    difficulity: changes game difficulity by increasing falling speed
    enable alpha: enables opacity and displays walls
    object depth: enables objects that can grow along z-axis
---
<h2 align="center">features</h2>

    collision detection: game doesnt allow rotation or movement if object can collide after that action.
    lighting using shaders
    fully configurable camera perspective with mouse
    random object generation
    color transition based on main object's color
    game pausing on not focusing window
    direction fix: keyboard inputs stays accurate by fixing movement based on camera angles even after changing camera perspective
    optimized plane scanning for detection filled x-z plane  
    sound effects on movement, rotation, fast drop, stacking, plane destruction
    responsive website 
    
  
