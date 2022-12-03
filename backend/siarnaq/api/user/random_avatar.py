import posixpath
import random
import uuid

import google.cloud.storage as storage
from django.conf import settings
from PIL import Image

from siarnaq.gcloud import titan


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


def get_avatar_url(entity):
    """Return a cache-safe URL to the avatar."""
    # To circumvent caching of old avatars, we append a UUID that changes on each
    # update.

    # check whether entity is user
    if type(entity).__name__ == "User":
        avatar_path = posixpath.join("user", str(entity.pk), "avatar.png")
    else:
        avatar_path = posixpath.join("team", str(entity.pk), "avatar.png")

    if not entity.has_avatar:

        entity.has_avatar = True
        entity.avatar_uuid = uuid.uuid4()
        entity.save(update_fields=["has_avatar", "avatar_uuid"])
        avatar = generate_avatar(entity.avatar_uuid.int)

        titan.upload_image(avatar, avatar_path)

    client = storage.Client.create_anonymous_client()
    public_url = (
        client.bucket(settings.GCLOUD_BUCKET_PUBLIC).blob(avatar_path).public_url
    )

    # Append UUID to public URL to prevent caching on avatar update
    return f"{public_url}?{entity.avatar_uuid}"
