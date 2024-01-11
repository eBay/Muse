import React, { useEffect, useRef } from 'react';

function center(options) {
  const defaults = {
    canvas: null,
    width: 128,
    height: 128,
    shape: 'square',
    fontColor: 'white',
    backgroundColor: 'black',
    text: 'C',
    fontFamily: 'Leckerli One',
    fontSize: 64,
  };
  const { canvas, width, height, shape, fontColor, backgroundColor, text, fontFamily, fontSize } = {
    ...defaults,
    ...options,
  };
  const ctx = canvas.getContext('2d');

  canvas.width = 2 * width;
  canvas.height = 2 * height;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(2, 2);

  drawBackground();
  drawText();

  function drawBackground() {
    switch (shape) {
      case 'square':
        drawSquare();
        break;
      case 'circle':
        drawCircle();
        break;
      case 'rounded':
        drawRounded();
        break;
      default:
        drawSquare();
        break;
    }
  }

  function drawSquare() {
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = backgroundColor;
    ctx.fill();
  }

  function drawCircle() {
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, height / 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = backgroundColor;
    ctx.fill();
  }

  function drawRounded() {
    ctx.beginPath();
    const radius = height / 10;
    ctx.moveTo(width, height);
    ctx.arcTo(0, height, 0, 0, radius);
    ctx.arcTo(0, 0, width, 0, radius);
    ctx.arcTo(width, 0, width, height, radius);
    ctx.arcTo(width, height, 0, height, radius);
    ctx.fillStyle = backgroundColor;
    ctx.fill();
  }

  function drawText() {
    ctx.fillStyle = fontColor;
    ctx.font = fontSize + 'px ' + fontFamily;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'center';
    const offsets = measureOffsets(text, fontFamily, fontSize);
    const x = width / 2 + offsets.horizontal;
    const y = height / 2 + offsets.vertical;
    ctx.fillText(text, x, y);
  }

  function measureOffsets(text, fontFamily, fontSize) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = fontSize + 'px ' + fontFamily;

    canvas.width = 2 * ctx.measureText(text).width;
    canvas.height = 2 * fontSize;

    ctx.font = fontSize + 'px ' + fontFamily;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const data = ctx.getImageData(
      0,
      0,
      canvas.width === 0 ? 1 : canvas.width,
      canvas.height === 0 ? 1 : canvas.height,
    ).data;

    let textTop;
    let textBottom;
    for (let y = 0; y <= canvas.height; y++) {
      for (let x = 0; x <= canvas.width; x++) {
        let r_index = 4 * (canvas.width * y + x);
        let r_value = data[r_index];

        if (r_value > 0) {
          if (!textTop) {
            textTop = y;
          }
          textBottom = y;
          break;
        }
      }
    }

    const canvasHorizontalCenterLine = canvas.height / 2;
    const textHorizontalCenterLine = (textBottom - textTop) / 2 + textTop;

    let textLeft;
    let textRight;
    for (let x = 0; x <= canvas.width; x++) {
      for (let y = 0; y <= canvas.height; y++) {
        let r_index = 4 * (canvas.width * y + x);
        let r_value = data[r_index];

        if (r_value > 0) {
          if (!textLeft) {
            textLeft = x;
          }
          textRight = x;
          break;
        }
      }
    }

    const canvasVerticalCenterLine = canvas.width / 2;
    const textVerticalCenterLine = (textRight - textLeft) / 2 + textLeft;

    return {
      vertical: canvasHorizontalCenterLine - textHorizontalCenterLine,
      horizontal: canvasVerticalCenterLine - textVerticalCenterLine,
    };
  }
}

export default function IconCanvas({ options, onLoad }) {
  const { text, shape, fontFamily, fontColor, backgroundColor, fontSize } = options;

  const canvasRef = useRef(null);

  useEffect(() => {
    onLoad(canvasRef.current);
  }, [onLoad]);

  useEffect(() => {
    const canvas = canvasRef.current;
    center({
      canvas: canvas,
      width: 100,
      height: 100,
      shape: shape.toLowerCase(),
      fontColor: fontColor,
      backgroundColor: backgroundColor,
      text: text,
      fontFamily: fontFamily,
      fontSize: fontSize,
    });
  }, [backgroundColor, shape, fontSize, text, fontColor, fontFamily]);

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
}
