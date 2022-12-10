import random

from django.conf import settings
from PIL import Image


def generate_avatar(seed):
    """Return a random avatar as a IMAGE object"""
    # generate a unique seed
    random.seed(seed)

    # generate unique rgb
    rgb1 = tuple(int(random.random() * 255) for _ in range(3))
    rgb2 = tuple(int(random.random() * 255) for _ in range(3))

    imgsize = settings.GCLOUD_MAX_AVATAR_SIZE  # The size of the image

    avatar = Image.new("RGB", imgsize)  # Create the image

    leftColor = rgb1  # Color at the right
    rightColor = rgb2  # Color at the left

    for pixel_y in range(imgsize[1]):
        for pixel_x in range(imgsize[0]):

            # Make it on a scale from 0 to 1
            dis = float(pixel_x + pixel_y) / (imgsize[0] + imgsize[1])

            # Calculate r, g, and b values
            r = rightColor[0] * dis + leftColor[0] * (1 - dis)
            g = rightColor[1] * dis + leftColor[1] * (1 - dis)
            b = rightColor[2] * dis + leftColor[2] * (1 - dis)

            avatar.putpixel((pixel_x, pixel_y), (int(r), int(g), int(b)))

    return avatar
