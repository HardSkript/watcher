TVwatcher
=======

A Anime / TV tracker made with Laravel


---
#Goals
1. To Keep track of tv shows and Anime. could be extended to manga and books
2. to be able to pin and favourite media (media being anything that the website could track)
3. tracking should be able to be done on a per show or per episode bases or pre season
4. uses should be able to make a new media (in case it is not in the database)


---
#Routes
- `/` = index
- `/tv/` = a list of featured tv show and or recommendation
- `/anime/`, `/manga/`, `/books/` same as tv but for anime, manga, and books respectively
- `/tv/list/` = full list of all tv shows
- `/anime/list/`, `/manga/list/`, `/books/list/` same as tv but for anime, manga, and books respectively
- `/tv/name_of_show/` links to the show description page, If there is a duplicate `/tv/name_of_show/` will link to the first one added to the database (as to not brake links) and the new one will have `/tv/name_of_show-(year_of_production)/` if there is another duplicate then the new show will be `/tv/name_of_show-(year_of_production)-[id]/`
- again manga, anime, and books will work the same
- `/tv/name_of_show/s1/` or `/tv/name_of_show/season-1/` ?? then `/tv/name_of_show/s1/e1/` or `/tv/name_of_show/s1e1/` or `/tv/name_of_show/season-1/episode-1/` or `/tv/name_of_show/season-1/name_of_episode/` or any combination 
