import re

with open("cinema.json", "r") as file:
    entries = file.read().splitlines()

    movie = entries[23]
    regex = r'"title": "(.*?)"' 

    m = re.search(regex, movie)
    if m:
        print(m.group(2))

