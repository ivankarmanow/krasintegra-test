class TokenNotProvidedException(Exception):
    def __str__(self):
        return f"Token not provided, but excepted"
