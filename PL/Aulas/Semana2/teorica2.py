import re 

with open('cinema.json', 'r') as file:
    movies = file.read()

    regex = r'"title": "(.*?)"'
    titles = re.findall(regex, movies)
    m = re.findall(regex, movies)

    if m:
        print(m)
