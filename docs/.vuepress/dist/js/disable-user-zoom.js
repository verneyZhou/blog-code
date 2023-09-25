
// 移动端 禁止用户对屏幕进行缩放 放大

window.onload = function() {
    document.addEventListener("touchstart", function(event) {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    });
    document.addEventListener("gesturestart", function(event) {
      event.preventDefault();
    });
  };