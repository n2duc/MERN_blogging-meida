```javascript
function readingTime() {
  const text = document.getElementById("article").innerText;
  const wpm = 265 ;
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / wpm);
  // wpm = words per minute
  document.getElementById("time").innerText = time;
}
readingTime();
```