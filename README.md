# Party En Mi Casa!

A fun party game for you and your amigos!  Create a room and have your friends join in on their phone.

## Directions for Running with Podman

Edit `env_template` and rename to `.env`.

Start databases:

```
podman compose up -d
```

## Development Ports

| Service | Port |
|---------|------|
| React Frontend | 3000 |
| WebSockets | 3001 |
| REST API | 3002 |
| MongoDB | 27017 |
| Mongo-Express | 8081 |
