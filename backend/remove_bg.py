# remove_bg.py
import sys
from rembg import remove
from PIL import Image
import io

def main():
    if len(sys.argv) != 3:
        print("Usage: python remove_bg.py input_path output_path")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    # 1. Open the input image (convert to RGBA to preserve transparency)
    img = Image.open(input_path).convert("RGBA")

    # 2. Remove background
    result = remove(img)

    # 3. Save to output_path
    result.save(output_path)

if __name__ == "__main__":
    main()
