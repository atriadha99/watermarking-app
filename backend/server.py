from flask import Flask, request, jsonify
from flask_cors import CORS
# TAMBAHKAN ImageColor DI SINI
from PIL import Image, ImageDraw, ImageFont, ImageColor 
import io
import base64

app = Flask(__name__)
CORS(app)

@app.route('/process-image', methods=['POST'])
def process_image():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        text = request.form.get('text', 'CONFIDENTIAL')
        position = request.form.get('position', 'center')
        
        # Parameter Interaktif
        opacity_level = int(request.form.get('opacity', 128))
        font_scale = int(request.form.get('size', 20)) 
        rotation_angle = int(request.form.get('rotation', 45))
        
        # --- PARAMETER WARNA BARU ---
        # Default Merah Netflix (#E50914) jika tidak ada input
        hex_color = request.form.get('color', '#E50914') 
        
        # Konversi Hex ke RGB menggunakan Pillow
        # Contoh: "#FFFFFF" -> (255, 255, 255)
        rgb_color = ImageColor.getrgb(hex_color)

        # 1. Buka Gambar
        img = Image.open(file.stream).convert("RGBA")
        width, height = img.size

        # 2. Setup Font
        font_size = int(width / font_scale)
        try:
            font = ImageFont.truetype("arialbd.ttf", font_size)
        except:
            font = ImageFont.load_default()

        # 3. Hitung Ukuran Teks
        temp_draw = ImageDraw.Draw(Image.new("RGBA", (1,1)))
        bbox = temp_draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]

        # 4. SET WARNA FINAL (GABUNGKAN RGB + OPACITY)
        # Kita ambil R, G, B dari hex, lalu tambahkan Alpha (Opacity)
        text_color = (rgb_color[0], rgb_color[1], rgb_color[2], opacity_level)
        
        # Stroke ikut transparan atau tetap hitam pekat (opsional, di sini kita buat hitam transparan)
        stroke_color = (0, 0, 0, opacity_level)

        # 5. Logic Posisi & Rotasi (SAMA SEPERTI SEBELUMNYA)
        if position == 'center':
            overlay = Image.new("RGBA", (width * 3, height * 3), (255, 255, 255, 0))
            draw = ImageDraw.Draw(overlay)
            
            cx, cy = overlay.size[0] // 2, overlay.size[1] // 2
            draw.text((cx - text_w//2, cy - text_h//2), text, font=font, fill=text_color, stroke_width=3, stroke_fill=stroke_color)
            
            rotated = overlay.rotate(rotation_angle, resample=Image.BICUBIC)
            
            left = (rotated.size[0] - width) // 2
            top = (rotated.size[1] - height) // 2
            watermark_crop = rotated.crop((left, top, left + width, top + height))
            
        else:
            watermark_crop = Image.new("RGBA", (width, height), (255, 255, 255, 0))
            draw = ImageDraw.Draw(watermark_crop)
            
            padding = int(width * 0.05)
            px, py = 0, 0
            
            if position == 'top-left': px, py = padding, padding
            elif position == 'top-right': px, py = width - text_w - padding, padding
            elif position == 'bottom-left': px, py = padding, height - text_h - padding
            elif position == 'bottom-right': px, py = width - text_w - padding, height - text_h - padding
            
            draw.text((px, py), text, font=font, fill=text_color, stroke_width=3, stroke_fill=stroke_color)

        # 6. Gabungkan & Return
        final_img = Image.alpha_composite(img, watermark_crop)
        buffered = io.BytesIO()
        final_img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return jsonify({'image': f"data:image/png;base64,{img_str}"})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)