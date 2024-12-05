from tkinter import *
from PIL import Image, ImageTk, ImageDraw, ImageFont
import requests
from io import BytesIO
import os


def create_translucent_box(x1, y1, x2, y2, opacity=0.5):
    box = Image.new("RGBA", (x2 - x1, y2 - y1))
    draw = ImageDraw.Draw(box)
    draw.rectangle([0, 0, x2 - x1, y2 - y1], fill=(0, 0, 0, int(255 * opacity)))  # RGBA
    return box

def create_text_image(text, font_size, color, width, height):
    img = Image.new('RGBA', (width, height), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except IOError:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((width-text_width)/2, (height-text_height)/2)
    draw.text(position, text, font=font, fill=color)
    return img

def create_thumbnail(author_name, song_name, thumbnail_url):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..', '..', '..'))
    background_path = os.path.join(project_root, 'src', 'api', 'assets', 'background.jpeg')
    
    try:
        base_image = Image.open(background_path)
        base_image = base_image.resize((400, 300), Image.LANCZOS)
    except FileNotFoundError:
        print(f"Background image not found at {background_path}. Using solid color background.")
        base_image = Image.new('RGB', (400, 300), (26, 26, 26))  # Dark background as fallback

    draw = ImageDraw.Draw(base_image)

    info_box = create_translucent_box(20, 20, 180, 100)
    base_image.paste(info_box, (20, 20), info_box)
    
    title_text = create_text_image(song_name, 20, "#ff6600", 160, 40)
    base_image.paste(title_text, (20, 20), title_text)
    
    author_text = create_text_image(author_name, 16, "#ffffff", 160, 40)
    base_image.paste(author_text, (20, 60), author_text)

    progress_box = create_translucent_box(200, 20, 380, 100)
    base_image.paste(progress_box, (200, 20), progress_box)
    
    draw.rectangle([220, 50, 360, 60], fill="#333333")
    draw.rectangle([220, 50, 250, 60], fill="#ff6600")
    
    time_start = create_text_image("0:00", 12, "#ffffff", 50, 20)
    base_image.paste(time_start, (220, 70), time_start)
    
    time_end = create_text_image("4m", 12, "#ffffff", 50, 20)
    base_image.paste(time_end, (310, 70), time_end)

    thumbnail_box = create_translucent_box(20, 120, 380, 280)
    base_image.paste(thumbnail_box, (20, 120), thumbnail_box)

    try:
        response = requests.get(thumbnail_url)
        thumbnail_image = Image.open(BytesIO(response.content))
        thumbnail_image = thumbnail_image.resize((340, 140), Image.LANCZOS)
        base_image.paste(thumbnail_image, (30, 130))
    except Exception as e:
        print(f"Error loading thumbnail: {e}")
        placeholder = create_text_image("Thumbnail Unavailable", 16, "#ffffff", 340, 140)
        base_image.paste(placeholder, (30, 130), placeholder)

    return base_image


def save_thumbnail(author_name, song_name, thumbnail_url, output_path):
    image = create_thumbnail(author_name, song_name, thumbnail_url)
    image.save(output_path)
    print(f"Thumbnail saved to {output_path}")



if __name__ == "__main__":
    author_name = "Anuv Jain"
    song_name = "Husn"
    thumbnail_url = "https://img.freepik.com/premium-psd/modern-youtube-thumbnail-design_892970-25.jpg"
    output_path = "output_thumbnail.png"
    
    save_thumbnail(author_name, song_name, thumbnail_url, output_path)
