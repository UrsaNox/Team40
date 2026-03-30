# Docker Setup (Optional)

Build and run with Docker:

```bash
# Build images
docker build -t sign-lang-frontend ./frontend
docker build -t sign-lang-backend ./backend

# Run containers
docker run -d -p 3000:3000 sign-lang-frontend
docker run -d -p 8000:8000 -e GEMINI_API_KEY=your_key sign-lang-backend

# Or use docker-compose
docker-compose up -d
```

## docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - ./backend:/app
    command: python -m uvicorn app.main:app --host 0.0.0.0

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://backend:8000
    volumes:
      - ./frontend:/app
    depends_on:
      - backend

  peerjs:
    image: node:18-alpine
    ports:
      - "9000:9000"
    working_dir: /app
    command: sh -c "npm install -g peerjs-server && peerjs --port 9000"
```
