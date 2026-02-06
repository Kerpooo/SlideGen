# ---- deps + runtime ----
FROM python:3.12-slim

WORKDIR /app

# System deps (mínimo útil)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

# Install uv (Astral)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files first for Docker cache
COPY pyproject.toml uv.lock* ./

# Install prod deps into a local venv (managed by uv)
RUN uv sync --frozen --no-dev

# Copy application code
COPY . .

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

EXPOSE 8000

# 👇 Cambia "main:app" si tu app vive en otro módulo
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
