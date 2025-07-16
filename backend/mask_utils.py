from PIL import Image, ImageDraw, ImageFilter

def create_furniture_mask(image_size, furniture_list):
    mask = Image.new('L', image_size, 0)  # Black background
    draw = ImageDraw.Draw(mask)
    for furniture in furniture_list:
        x, y = furniture['x'], furniture['y']
        w, h = furniture['width'], furniture['height']
        draw.rectangle([x, y, x + w, y + h], fill=255)
    return mask 