#!/bin/bash

# Script to set the ByteBot wallpaper
echo "Setting ByteBot wallpaper..."

# Set wallpaper using xfconf-query
xfconf-query -c xfce4-desktop -p /backdrop/screen0/monitor0/workspace0/last-image -s "/usr/share/backgrounds/bytebot-background.jpg"
xfconf-query -c xfce4-desktop -p /backdrop/screen0/monitor0/workspace0/image-style -s 5

# Also set it for the current session
xfdesktop --reload

echo "Wallpaper set successfully!"
