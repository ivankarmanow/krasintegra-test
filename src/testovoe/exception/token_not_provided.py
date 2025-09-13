class TokenNotProvidedException(Exception):
    def __str__(self):
        return f"Token was not provided, but excepted"
