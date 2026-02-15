#!/usr/bin/env python3
from PIL import Image, ImageDraw

# Lobster color palette
ORANGE = (255, 107, 53)
BRIGHT_ORANGE = (255, 165, 0)
YELLOW = (255, 255, 0)
BROWN = (139, 69, 19)

def create_idle():
    img = Image.new('RGBA', (8, 16), (0, 0, 0, 0))
    pixels = img.load()
    
    # Body
    for x in range(2, 6): pixels[x, 4] = ORANGE
    for x in range(2, 6): pixels[x, 5] = ORANGE
    for x in range(2, 6): pixels[x, 6] = ORANGE
    for x in range(3, 5): 
        for y in range(6, 11): pixels[x, y] = ORANGE
    
    # Claws
    pixels[1, 3] = ORANGE
    pixels[1, 4] = ORANGE
    pixels[6, 3] = ORANGE
    pixels[6, 4] = ORANGE
    pixels[0, 2] = ORANGE
    pixels[7, 2] = ORANGE
    
    # Legs
    pixels[2, 10] = ORANGE
    pixels[2, 11] = ORANGE
    pixels[5, 10] = ORANGE
    pixels[5, 11] = ORANGE
    
    # Eyes
    pixels[2, 5] = BRIGHT_ORANGE
    pixels[5, 5] = BRIGHT_ORANGE
    
    return img

def create_walking():
    img = Image.new('RGBA', (8, 16), (0, 0, 0, 0))
    pixels = img.load()
    
    # Body (shifted up slightly)
    for x in range(2, 6): 
        for y in range(5, 8): pixels[x, y] = ORANGE
    for x in range(3, 5): 
        for y in range(7, 12): pixels[x, y] = ORANGE
    
    # Claws
    pixels[1, 4] = ORANGE
    pixels[1, 5] = ORANGE
    pixels[6, 4] = ORANGE
    pixels[6, 5] = ORANGE
    pixels[0, 3] = ORANGE
    pixels[7, 3] = ORANGE
    
    # Legs (alternate position)
    pixels[1, 11] = ORANGE
    pixels[1, 12] = ORANGE
    pixels[6, 11] = ORANGE
    pixels[6, 12] = ORANGE
    
    # Eyes
    pixels[2, 6] = BRIGHT_ORANGE
    pixels[5, 6] = BRIGHT_ORANGE
    
    return img

def create_excited():
    img = Image.new('RGBA', (8, 16), (0, 0, 0, 0))
    pixels = img.load()
    
    # Body (higher up)
    for x in range(2, 6): 
        for y in range(3, 6): pixels[x, y] = ORANGE
    for x in range(3, 5): 
        for y in range(5, 10): pixels[x, y] = ORANGE
    
    # Claws raised
    pixels[1, 2] = ORANGE
    pixels[1, 3] = ORANGE
    pixels[6, 2] = ORANGE
    pixels[6, 3] = ORANGE
    pixels[0, 1] = ORANGE
    pixels[7, 1] = ORANGE
    
    # Legs
    pixels[2, 9] = ORANGE
    pixels[2, 10] = ORANGE
    pixels[5, 9] = ORANGE
    pixels[5, 10] = ORANGE
    
    # Excited eyes
    pixels[2, 4] = YELLOW
    pixels[5, 4] = YELLOW
    pixels[3, 2] = YELLOW
    pixels[4, 2] = YELLOW
    
    return img

def create_sleeping():
    img = Image.new('RGBA', (8, 16), (0, 0, 0, 0))
    pixels = img.load()
    
    # Body (lower, resting)
    for x in range(2, 6): 
        for y in range(8, 11): pixels[x, y] = ORANGE
    for x in range(3, 5): 
        for y in range(10, 15): pixels[x, y] = ORANGE
    
    # Claws tucked
    pixels[1, 7] = ORANGE
    pixels[1, 8] = ORANGE
    pixels[6, 7] = ORANGE
    pixels[6, 8] = ORANGE
    pixels[0, 6] = ORANGE
    pixels[7, 6] = ORANGE
    
    # Closed eyes
    for x in range(2, 6): pixels[x, 9] = BROWN
    
    return img

# Create all sprites
create_idle().save('assets/idle.png')
create_walking().save('assets/walking.png')
create_excited().save('assets/excited.png')
create_sleeping().save('assets/sleeping.png')

print("Sprites created successfully!")
