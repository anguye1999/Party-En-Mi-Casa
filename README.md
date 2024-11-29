# Party En Mi Casa!

A fun party game for you and your amigos!  Create a room and have your friends join in on their phone.

## Directions for Running with Podman

Edit all `env_template` and rename to `.env`.

Start databases:

```
podman compose -f ./db/docker-compose.yml up -d
```

Run frontend with vite:

```
cd frontend
npm run dev
```

Run backend:

```
node ./backend/server.js
```
