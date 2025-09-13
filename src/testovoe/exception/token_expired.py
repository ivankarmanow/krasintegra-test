class TokenExpiredException(Exception):
    def __init__(self, token: str):
        self.token = token

    def __str__(self):
        return f"Token expired: {self.token}"
