// Utility to composite room and furniture images onto a canvas
// furnitureItems: [{ image: dataURL, position: {x, y}, scale, rotation }]
// roomImage: dataURL
// width, height: canvas size (must match the uploaded room image's natural size)
export async function compositeRoomWithFurniture(roomImage, furnitureItems, width, height) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Draw room background with backgroundSize: 'cover', backgroundPosition: 'center'
    const roomImg = new window.Image();
    roomImg.onload = async () => {
      // Calculate cover sizing
      const imgAspect = roomImg.width / roomImg.height;
      const canvasAspect = width / height;
      let drawWidth, drawHeight, offsetX, offsetY;
      if (imgAspect > canvasAspect) {
        // Image is wider than canvas
        drawHeight = height;
        drawWidth = height * imgAspect;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Image is taller than canvas
        drawWidth = width;
        drawHeight = width / imgAspect;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      }
      ctx.drawImage(roomImg, offsetX, offsetY, drawWidth, drawHeight);

      // Draw each furniture item
      for (const item of furnitureItems) {
        await new Promise((res) => {
          const furnImg = new window.Image();
          furnImg.onload = () => {
            ctx.save();
            // Move to furniture top-left, then to center for rotation/scale
            const baseW = 100, baseH = 100;
            const centerX = item.position.x + baseW / 2;
            const centerY = item.position.y + baseH / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate((item.rotation || 0) * Math.PI / 180);
            ctx.scale(item.scale || 1, item.scale || 1);
            // Draw image centered, with object-fit: contain
            // Calculate aspect fit for furniture image
            let drawW = baseW, drawH = baseH;
            const imgAR = furnImg.width / furnImg.height;
            if (imgAR > 1) {
              drawH = baseW / imgAR;
            } else {
              drawW = baseH * imgAR;
            }
            ctx.drawImage(furnImg, -drawW/2, -drawH/2, drawW, drawH);
            ctx.restore();
            res();
          };
          furnImg.onerror = res; // skip on error
          furnImg.src = item.image;
        });
      }
      // Convert to Blob
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      }, 'image/png');
    };
    roomImg.onerror = () => reject(new Error('Failed to load room image'));
    roomImg.src = roomImage;
  });
} 