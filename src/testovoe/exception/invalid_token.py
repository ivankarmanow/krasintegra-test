class InvalidTokenException(Exception):
    def __init__(self, token: str):
        self.token = token

    def __str__(self):
        return f"Invalid token {self.token}"
