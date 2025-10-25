# 1. Start from a clean, official Python 3.11 base
FROM python:3.11-slim

# 2. Set a working directory inside the container
WORKDIR /app

# 3. Set an environment variable so Python output is unbuffered (good for logs)
ENV PYTHONUNBUFFERED=1

# 4. Copy ONLY the requirements file first to leverage Docker's cache
COPY requirements.txt .

# 5. Install all Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy ALL your other code into the container
# (The .dockerignore file will make sure we don't copy junk)
COPY . .

# 7. Expose the port that gunicorn will run on
EXPOSE 5000

# 8. This is the DEFAULT command to run. We will OVERRIDE this
# for our worker and beat services in the Render dashboard.
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
