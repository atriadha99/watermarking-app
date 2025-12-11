from PIL import Image, ImageDraw, ImageFont
import os

def create_watermark(input_path, output_path, text="NETFLIX ORIGINAL"):
    try:
        # 1. Buka Gambar Asli
        base_image = Image.open(input_path).convert("RGBA")
        width, height = base_image.size

        # 2. Buat Layer Transparan (Overlay) untuk Watermark
        # Ukuran layer dibuat 4x lebih besar agar saat dirotasi tidak terpotong
        txt_layer = Image.new("RGBA", (width * 2, height * 2), (255, 255, 255, 0))
        draw = ImageDraw.Draw(txt_layer)

        # 3. Setting Font (Dinamis sesuai lebar gambar)
        font_size = int(width / 15)
        try:
            # Coba pakai Arial Bold jika ada
            font = ImageFont.truetype("arialbd.ttf", font_size)
        except:
            # Fallback ke font default
            font = ImageFont.load_default()

        # 4. Hitung Ukuran Teks
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]

        # 5. Tentukan Posisi Tengah (Center) di Layer Overlay
        # Kita gambar di tengah canvas overlay yang besar tadi
        text_x = (width * 2 - text_w) // 2
        text_y = (height * 2 - text_h) // 2

        # 6. Gambar Teks (Warna Merah Netflix Transparan)
        # (229, 9, 20) is Netflix Red, 180 is Alpha/Transparency
        draw.text((text_x, text_y), text, font=font, fill=(229, 9, 20, 180))
        
        # Tambah Stroke/Outline Hitam (Opsional biar kebaca)
        stroke_width = 2
        draw.text((text_x, text_y), text, font=font, fill=(229, 9, 20, 180), stroke_width=stroke_width, stroke_fill="black")

        # 7. Rotasi Text 45 Derajat
        rotated_layer = txt_layer.rotate(45, expand=True, resample=Image.BICUBIC)

        # 8. Crop kembali layer rotasi ke ukuran gambar asli
        # Cari titik tengah layer rotasi
        rot_w, rot_h = rotated_layer.size
        left = (rot_w - width) // 2
        top = (rot_h - height) // 2
        right = left + width
        bottom = top + height
        
        watermark_crop = rotated_layer.crop((left, top, right, bottom))

        # 9. Gabungkan (Alpha Blending/Compositing)
        combined = Image.alpha_composite(base_image, watermark_crop)

        # 10. Simpan Hasil
        # Convert balik ke RGB karena JPG tidak support Alpha
        final_image = combined.convert("RGB") 
        final_image.save(output_path, "JPEG")
        combined.save(output_path, "PNG")
        
        print(f"✅ Sukses! Gambar tersimpan di: {output_path}")

    except Exception as e:
        print(f"❌ Error: {e}")

# --- CARA PAKAI ---
# Pastikan ada file gambar bernama 'input.jpg' di folder yang sama
if __name__ == "__main__":
    # Ganti 'input.jpg' dengan nama file gambarmu
    input_file = "input.jpg" 
    
    # Cek apakah file ada
    if os.path.exists(input_file):
        print("Sedang memproses gambar dengan Python...")
        create_watermark(input_file, "hasil_python.jpg", "COPYRIGHT 2025")
    else:
        print(f"File '{input_file}' tidak ditemukan. Mohon siapkan gambar dulu.")